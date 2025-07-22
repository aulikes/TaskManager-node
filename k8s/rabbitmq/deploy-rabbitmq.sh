#!/bin/bash

NAMESPACE="taskmanager-node-dev"

echo "Eliminando recursos anteriores (si existen)..."
kubectl delete deployment rabbitmq-deployment -n "$NAMESPACE" --ignore-not-found
kubectl delete service rabbitmq-service -n "$NAMESPACE" --ignore-not-found
kubectl delete pvc rabbitmq-pvc -n "$NAMESPACE" --ignore-not-found
kubectl delete secret rabbitmq-secret -n "$NAMESPACE" --ignore-not-found
kubectl delete configmap rabbitmq-config -n "$NAMESPACE" --ignore-not-found

echo ""
echo "Verificando si el namespace '$NAMESPACE' existe..."
if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
  echo "Namespace no existe. Creando..."
  kubectl create namespace "$NAMESPACE"
else
  echo "Namespace '$NAMESPACE' ya existe."
fi

echo ""
echo "Aplicando archivos YAML..."
kubectl apply -f 1-pvc-dev.yaml -n "$NAMESPACE"
kubectl apply -f 2-secret-dev.yaml -n "$NAMESPACE"
kubectl apply -f 3-configmap-dev.yaml -n "$NAMESPACE"
kubectl apply -f 4-deployment-dev.yaml -n "$NAMESPACE"
kubectl apply -f 5-service-dev.yaml -n "$NAMESPACE"

echo ""
echo "Verificando usuario y contraseña (decodificados):"
USER=$(kubectl get secret rabbitmq-secret -n "$NAMESPACE" -o jsonpath="{.data.username}" | base64 --decode)
PASS=$(kubectl get secret rabbitmq-secret -n "$NAMESPACE" -o jsonpath="{.data.password}" | base64 --decode)

echo "Usuario: $USER"
echo "Contraseña: $PASS"

echo ""
echo "RabbitMQ desplegado correctamente en el namespace '$NAMESPACE'."
echo "Accede a la interfaz en: http://localhost:31572"
