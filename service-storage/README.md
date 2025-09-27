# DevOps Exercise 1 – Multi-Service System

This project demonstrates a simple distributed system built with Docker and Docker Compose.  
It contains three services:  
- **Gateway (Service 1, Node.js)** – Handles incoming requests and coordinates the workflow.  
- **App (Service 2, Python + Flask)** – Produces status information and logs requests.  
- **Storage (Service 3, Python + Flask)** – Stores logs persistently and serves them over HTTP.  

---

## Platform Information

- **Hardware**: Desktop PC  
- **OS**: Windows 10, 64-bit  
- **Docker Version**: 28.4.0, build d8eb465  
- **Docker Compose Version**: v2.39.2-desktop.1  

---

## Architecture

The system is orchestrated via Docker Compose.  
- **Gateway** runs on port **8199** and exposes `/status` and `/log`.  
- **App** generates status information and writes logs to two persistent storages.  
- **Storage** provides a REST API to persist and retrieve logs.  

### Volumes
- `./vstorage` → mounted by **Gateway** and **App** (host-based persistence).  
- `storageVolume` → mounted by **Storage** container (container-managed persistence).  

### Diagram
![image](/DevopsExercise1.jpg)

---

## Workflow

1. **GET localhost:8199/status**  
   - Gateway (Service 1) generates its status record.  
   - Record is written to both `./vstorage` and Storage service.  
   - Gateway calls App (Service 2).  
   - App generates its status record, logs it, and returns it.  
   - Gateway combines both records and returns them in plain text.  

2. **GET localhost:8199/log**  
   - Gateway forwards the request to Storage.  
   - Storage returns the complete log.  

---

## Example Status Records
```
Timestamp1: 2025-09-20T11:56:44Z: uptime 0.00 hours, free disk in root: 966754 MBytes  
Timestamp2: 2025-09-20T11:56:44Z: uptime 0.00 hours, free disk in root: 966754 MBytes
```

- **Disk Space**: measured with `df -k /` inside the container (container root filesystem).  
- **Uptime**: process runtime since container start (Node.js `process.uptime()`, Python `time.time() - start_time`).  

### Relevance
- Disk space in container root is not meaningful in production (containers share host storage).  
- Uptime only reflects container lifetime, not service health.  

### Improvements
- Measure actual application-specific volumes or host disk usage.  
- Add health checks and richer monitoring.  

---

## Persistent Storage Analysis

- **vStorage (./vstorage)**  
  - Mounted from host file system.  
  - Simple, persistent across runs.  
  - Bad practice in cloud-native design – host-dependent, not portable or scalable.  

- **Storage Container (storageVolume)**  
  - Runs as a dedicated container.  
  - Exposes REST API for logging.  
  - Cloud-native, modular, portable.  
  - Slightly more complex to implement.  

---

## Setup & Run

### 1. Build and start services
docker-compose up --build
### 2. Access endpoints

Get combined status:
```bash
curl localhost:8199/status
```

View logs:
```bash
curl localhost:8199/log
```
---
##  Cleanup Instructions

Run on Linux (as teacher’s environment will be Linux):

Stop services and remove project volumes
```bash
docker-compose down -v
```

Clear host-mounted log file
```bash
rm -rf ./vstorage && touch ./vstorage && chmod 666 ./vstorage
```
