#!/bin/bash

NAMESPACE="taskmanager-node-dev"

echo "Limpiando recursos anteriores..."
kubectl delete -f 3-service-mongo-logger.yaml -n "$NAMESPACE" --ignore-not-found
kubectl delete -f 2-deployment-mongo-logger.yaml -n "$NAMESPACE" --ignore-not-found
kubectl delete -f 1-pvc-mongo-logger.yaml -n "$NAMESPACE" --ignore-not-found
kubectl delete -f 0-pv-mongo-logger.yaml --ignore-not-found

echo "Creando recursos para MongoDB Logger..."
kubectl apply -f 0-pv-mongo-logger.yaml
kubectl apply -f 1-pvc-mongo-logger.yaml -n "$NAMESPACE"
kubectl apply -f 2-deployment-mongo-logger.yaml -n "$NAMESPACE"
kubectl apply -f 3-service-mongo-logger.yaml -n "$NAMESPACE"

echo ""
echo "MongoDB Logger desplegado en namespace '$NAMESPACE'."
echo "Puedes acceder al servicio desde tu host en: mongodb://localhost:30017"
