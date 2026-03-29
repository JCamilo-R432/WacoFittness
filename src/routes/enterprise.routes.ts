import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { multiTenant, requireOrg, requireOrgRole } from '../middleware/multiTenant';
import {
  createOrganization, getOrganization, listMyOrganizations,
  inviteMember, removeMember,
  getWhiteLabel, updateWhiteLabel, getWhiteLabelByDomain,
  configureSSOSAML, initiateSSOLogin,
  scimListUsers, scimCreateUser, scimUpdateUser,
  listAPIKeys, createAPIKey, revokeAPIKey,
} from '../controllers/enterprise.controller';

const router = Router();

// Public: resolve white-label by custom domain
router.get('/white-label/domain', getWhiteLabelByDomain);

// SSO initiation (public, redirected from org login page)
router.get('/sso/init', initiateSSOLogin);

// All other routes require auth
router.use(authenticate);

// My organizations
router.get('/my-orgs', listMyOrganizations);
router.post('/', createOrganization);

// Org-scoped routes
router.use(multiTenant);

// Org info
router.get('/org', requireOrg, getOrganization);

// Member management (admin+)
router.post('/org/members', requireOrg, requireOrgRole('admin', 'owner'), inviteMember);
router.delete('/org/members/:userId', requireOrg, requireOrgRole('owner'), removeMember);

// White-label (admin+)
router.get('/org/white-label', requireOrg, requireOrgRole('admin', 'owner'), getWhiteLabel);
router.put('/org/white-label', requireOrg, requireOrgRole('admin', 'owner'), updateWhiteLabel);

// SSO (owner only)
router.post('/org/sso/saml', requireOrg, requireOrgRole('owner'), configureSSOSAML);

// SCIM provisioning (owner only)
router.get('/org/scim/users', requireOrg, requireOrgRole('owner'), scimListUsers);
router.post('/org/scim/users', requireOrg, requireOrgRole('owner'), scimCreateUser);
router.patch('/org/scim/users/:userId', requireOrg, requireOrgRole('owner'), scimUpdateUser);

// API Keys (admin+)
router.get('/org/api-keys', requireOrg, requireOrgRole('admin', 'owner'), listAPIKeys);
router.post('/org/api-keys', requireOrg, requireOrgRole('admin', 'owner'), createAPIKey);
router.delete('/org/api-keys/:keyId', requireOrg, requireOrgRole('admin', 'owner'), revokeAPIKey);

export default router;
