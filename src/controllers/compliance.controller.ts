import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrgRequest } from '../middleware/multiTenant';
import complianceService from '../services/compliance.service';
import { ComplianceFramework } from '../shared/constants/ComplianceFrameworks';
import prisma from '../config/database';

type Req = AuthRequest & OrgRequest;

export const runControls = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { framework } = req.params;
    const validFrameworks: ComplianceFramework[] = ['SOC2', 'HIPAA', 'GDPR'];

    if (!validFrameworks.includes(framework as ComplianceFramework)) {
      res.status(400).json({ error: `Framework inválido. Opciones: ${validFrameworks.join(', ')}` });
      return;
    }

    const results = await complianceService.runFramework(
      framework as ComplianceFramework,
      req.organization?.id,
    );

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    res.json({
      success: true,
      framework,
      summary: { total: results.length, passed, failed, passRate: Math.round((passed / results.length) * 100) },
      results,
    });
  } catch (err) { next(err); }
};

export const getComplianceReport = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { framework } = req.params;
    const report = await complianceService.generateReport(
      framework as ComplianceFramework,
      req.organization?.id,
    );
    res.json({ success: true, report });
  } catch (err) { next(err); }
};

export const getAuditHistory = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { framework, limit = '50' } = req.query;
    const history = await complianceService.getAuditHistory(
      framework as ComplianceFramework | undefined,
      req.organization?.id,
      parseInt(String(limit), 10),
    );
    res.json({ success: true, history });
  } catch (err) { next(err); }
};

export const exportDataGDPR = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await complianceService.handleDataExportRequest(req.user!.id);
    res.setHeader('Content-Disposition', `attachment; filename=wacopro-data-export-${req.user!.id}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (err) { next(err); }
};

export const deleteDataGDPR = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { confirm } = req.body;
    if (confirm !== 'DELETE_MY_ACCOUNT') {
      res.status(400).json({ error: 'Envía confirm: "DELETE_MY_ACCOUNT" para confirmar la eliminación' });
      return;
    }

    await complianceService.handleDataDeletionRequest(req.user!.id);
    res.json({ success: true, message: 'Cuenta y datos eliminados correctamente' });
  } catch (err) { next(err); }
};

export const getDataResidencyConfig = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rule = await prisma.dataResidencyRule.findUnique({
      where: { organizationId: req.organization!.id },
    });
    res.json({ success: true, rule });
  } catch (err) { next(err); }
};

export const setDataResidency = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { allowedRegions, primaryRegion, blockCrossRegion, piiFields, retentionDays } = req.body;

    const rule = await prisma.dataResidencyRule.upsert({
      where: { organizationId: req.organization!.id },
      update: { allowedRegions, primaryRegion, blockCrossRegion, piiFields, retentionDays, updatedAt: new Date() },
      create: {
        organizationId: req.organization!.id,
        allowedRegions: allowedRegions || ['us-east-1'],
        primaryRegion: primaryRegion || 'us-east-1',
        blockCrossRegion: blockCrossRegion || false,
        piiFields: piiFields || [],
        retentionDays: retentionDays || 2555,
      },
    });

    res.json({ success: true, rule });
  } catch (err) { next(err); }
};
