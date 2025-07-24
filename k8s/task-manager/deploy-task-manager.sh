#!/bin/bash

NAMESPACE="taskmanager-node-dev"
CONTAINERD_NAMESPACE="k8s.io"
IMAGE_NAME="task-manager-node:dev"
DOCKERFILE_PATH="../../task-manager-node"
PROFILE="taskmanager"

echo ""
echo "Verificando si Colima está usando containerd + Kubernetes..."
STATUS_OUTPUT=$(colima status --profile "$PROFILE" 2>&1)
if echo "$STATUS_OUTPUT" | grep -q 'runtime: containerd' && echo "$STATUS_OUTPUT" | grep -q 'kubernetes: enabled'; then
  echo "Colima ya está usando containerd y Kubernetes con el perfil '$PROFILE'."
else
  echo "Colima no está correctamente configurado. Reiniciando con containerd + Kubernetes..."
  colima stop --profile "$PROFILE"
  colima delete --profile "$PROFILE" --force
  colima start --runtime containerd --kubernetes --cpu 4 --memory 6 --disk 40 --profile "$PROFILE"
fi

echo ""
echo "Verificando si nerdctl está instalado..."
if ! colima nerdctl --profile "$PROFILE" --help &> /dev/null; then
  echo "nerdctl no encontrado. Instalando alias con colima..."
  colima nerdctl install
else
  echo "nerdctl ya está disponible."
fi

# echo ""
# echo "====================================="
# echo "Construyendo imagen Docker local..."
# echo "====================================="
# docker build -t "$IMAGE_NAME" "$DOCKERFILE_PATH"

echo ""
echo "Construyendo imagen Docker para ARM64..."
docker buildx build --platform=linux/arm64 -t "$IMAGE_NAME" "$DOCKERFILE_PATH" --load

echo ""
echo "Exportando e importando imagen"
docker save "$IMAGE_NAME" -o task-manager-node.tar
colima nerdctl --profile "$PROFILE" --namespace "$CONTAINERD_NAMESPACE" load < task-manager-node.tar

echo ""
echo "Etiquetando imagen sin prefijo 'localhost/'..."
colima nerdctl --profile "$PROFILE" --namespace "$CONTAINERD_NAMESPACE" tag localhost/"$IMAGE_NAME" "$IMAGE_NAME"


echo ""
echo "=================================="
echo "Eliminando recursos anteriores..."
echo "=================================="
kubectl delete deployment task-manager-deployment -n "$NAMESPACE" --ignore-not-found
kubectl delete service task-manager-service -n "$NAMESPACE" --ignore-not-found
kubectl delete configmap task-manager-configmap -n "$NAMESPACE" --ignore-not-found
kubectl delete secret task-manager-secret -n "$NAMESPACE" --ignore-not-found

echo ""
echo "Verificando existencia del namespace '$NAMESPACE'..."
if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
  echo "Namespace no existe. Creando..."
  kubectl create namespace "$NAMESPACE"
else
  echo "Namespace '$NAMESPACE' ya existe."
fi

echo ""
echo "Aplicando archivos YAML..."
kubectl apply -f 1-secret-task-manager.yaml -n "$NAMESPACE"
kubectl apply -f 2-configmap-task-manager.yaml -n "$NAMESPACE"
kubectl apply -f 3-deployment-task-manager.yaml -n "$NAMESPACE"
kubectl apply -f 4-service-task-manager.yaml -n "$NAMESPACE"

echo ""
echo "Mostrando detalles del Service:"
kubectl get svc task-manager-service -n "$NAMESPACE"

echo ""
echo "Mostrando imagenes de colima:"
colima nerdctl --profile "$PROFILE" --namespace "$CONTAINERD_NAMESPACE" images


NODE_PORT=$(kubectl get service task-manager-service -n "$NAMESPACE" -o=jsonpath='{.spec.ports[0].nodePort}')

echo ""
echo "Despliegue completado. Accede a Task Manager en: http://localhost:$NODE_PORT"
