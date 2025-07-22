#!/bin/bash

NAMESPACE="taskmanager-node-dev"

echo "Eliminando recursos anteriores (si existen)..."
kubectl delete -f 3-service-mongo-failed.yaml -n "$NAMESPACE" --ignore-not-found
kubectl delete -f 2-deployment-mongo-failed.yaml -n "$NAMESPACE" --ignore-not-found
kubectl delete -f 1-pvc-mongo-failed.yaml -n "$NAMESPACE" --ignore-not-found
kubectl delete -f 0-pv-mongo-failed.yaml --ignore-not-found

echo "Creando PersistentVolume..."
kubectl apply -f 0-pv-mongo-failed.yaml

echo "Creando PersistentVolumeClaim..."
kubectl apply -f 1-pvc-mongo-failed.yaml -n "$NAMESPACE"

echo "Creando Deployment..."
kubectl apply -f 2-deployment-mongo-failed.yaml -n "$NAMESPACE"

echo "Creando Service..."
kubectl apply -f 3-service-mongo-failed.yaml -n "$NAMESPACE"

echo ""
echo "MongoDB (eventos fallidos) desplegado correctamente en el namespace '$NAMESPACE'."
echo "Accede externamente vía: mongodb://localhost:32017"
