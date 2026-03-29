# Kubernetes Deployment Guide — WacoPro Phase 5

## Prerequisites

```bash
# Required tools
kubectl version --client    # >= 1.28
kustomize version           # >= 5.0
helm version                # >= 3.12
argocd version              # >= 2.9

# Required infrastructure
# - 3 Kubernetes clusters (US East, EU Central, AP Southeast) — EKS/GKE/AKS
# - ArgoCD installed on each cluster
# - Istio 1.20+ installed on each cluster
# - cert-manager for TLS
# - prometheus-stack for monitoring
```

---

## 1. Initial Cluster Setup

```bash
# For each cluster (us-east, eu-central, ap-southeast):

# Install Istio
istioctl install --set profile=production \
  --set values.pilot.traceSampling=1.0

# Enable Istio sidecar injection in namespace
kubectl label namespace wacopro-production istio-injection=enabled

# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## 2. Deploy Application

```bash
# Option A: Direct kubectl (first deploy)
kubectl apply -k k8s/overlays/production-us-east
kubectl apply -k k8s/overlays/production-eu-central
kubectl apply -k k8s/overlays/production-ap-southeast

# Option B: ArgoCD (recommended — GitOps)
kubectl apply -f k8s/argocd/Application.yaml -n argocd
# ArgoCD will sync automatically from GitHub

# Check sync status
argocd app get wacopro-us-east
argocd app sync wacopro-us-east
```

---

## 3. Configure Secrets

```bash
# For each cluster, create secrets (never commit to git)
kubectl create secret generic wacopro-secrets \
  --namespace wacopro-production \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=DIRECT_URL="postgresql://..." \
  --from-literal=JWT_SECRET="..." \
  --from-literal=OPENAI_API_KEY="sk-..." \
  --from-literal=STRIPE_SECRET_KEY="sk_live_..." \
  --from-literal=STRIPE_WEBHOOK_SECRET="whsec_..."

# Verify
kubectl get secret wacopro-secrets -n wacopro-production
```

---

## 4. Apply Istio Service Mesh

```bash
kubectl apply -f infrastructure/service-mesh/istio/virtual-service.yaml
kubectl apply -f infrastructure/service-mesh/istio/authorization-policy.yaml

# Verify
kubectl get virtualservice -n wacopro-production
kubectl get authorizationpolicy -n wacopro-production
istioctl analyze -n wacopro-production
```

---

## 5. Canary Deployments

```bash
# 1. Build and tag v2 image
docker build -t ghcr.io/wacopro/backend:v2-sha-abc123 .
docker push ghcr.io/wacopro/backend:v2-sha-abc123

# 2. Deploy v2 alongside v1 (5% traffic)
# Already configured in virtual-service.yaml

# 3. Update v2 deployment
kubectl set image deployment/wacopro-backend-v2 \
  wacopro-backend=ghcr.io/wacopro/backend:v2-sha-abc123 \
  -n wacopro-production

# 4. Monitor error rate
kubectl exec -n monitoring prometheus-0 -- promtool query instant \
  'rate(http_requests_total{version="v2",status=~"5.."}[5m])'

# 5. If healthy: promote to 100%
# Edit virtual-service.yaml → set v1 weight to 0, v2 to 100
# OR: kubectl argo rollouts promote wacopro-backend

# 6. If errors: rollback immediately
kubectl argo rollouts abort wacopro-backend
# OR: revert virtual-service.yaml to v1=100%
```

---

## 6. Horizontal Pod Autoscaler

```bash
# Check current scaling
kubectl get hpa -n wacopro-production

# Watch scaling in real-time
kubectl get hpa -n wacopro-production -w

# Test scaling (load test)
kubectl run load-test --image=busybox --restart=Never -- \
  sh -c "while true; do wget -O- http://wacopro-backend/api/health; done"
```

---

## 7. Rollback

```bash
# Instant rollback to previous revision
kubectl rollout undo deployment/wacopro-backend -n wacopro-production

# Rollback to specific revision
kubectl rollout history deployment/wacopro-backend -n wacopro-production
kubectl rollout undo deployment/wacopro-backend --to-revision=3 -n wacopro-production

# Via ArgoCD (click "Rollback" in UI or):
argocd app rollback wacopro-us-east 3
```

---

## 8. Multi-Region Verification

```bash
# Test US East endpoint
curl -H "CF-IPCountry: US" https://api.wacopro.com/api/health
# Response header: X-Served-Region: us-east-1

# Test EU routing (GDPR)
curl -H "CF-IPCountry: DE" https://api.wacopro.com/api/health
# Response header: X-Served-Region: eu-central-1

# Test AP routing
curl -H "CF-IPCountry: JP" https://api.wacopro.com/api/health
# Response header: X-Served-Region: ap-southeast-1
```

---

## 9. SLO Monitoring

```bash
# Deploy SLO rules (Prometheus)
kubectl apply -f infrastructure/monitoring/slo-rules.yaml

# Check error budget
curl http://prometheus:9090/api/v1/query \
  --data-urlencode 'query=1 - (sum(rate(http_requests_total{status=~"5.."}[30d])) / sum(rate(http_requests_total[30d])))'
# Result should be > 0.999 (99.9% availability)
```

---

## Troubleshooting

```bash
# Pod not starting
kubectl describe pod -l app=wacopro-backend -n wacopro-production
kubectl logs -l app=wacopro-backend -n wacopro-production --tail=100

# Istio issues
istioctl proxy-status
istioctl proxy-config cluster <pod-name> -n wacopro-production

# ArgoCD sync issues
argocd app get wacopro-us-east
argocd app sync wacopro-us-east --force
```
