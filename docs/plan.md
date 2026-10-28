# Assessment Plan: CVAT Annotation Analytics

## 1. Objective
To extend CVAT by introducing an API endpoint for per-class annotation analytics, rendering these counts as a graph on a frontend page, enforcing login and task permissions, adding WebSocket updates, and benchmarking performance.

## 2. Execution Schedule (8 Hours Total)
* **Hours 1–2:** Environment Setup, Fork/Clone, Docker stack launch, and COCO dataset upload.
* **Hours 3–4:** Create Django app `test`, build backend API for per-class counts using database models (`LabeledShape`, `Label`), and enforce permissions.
* **Hours 5–6:** Implement frontend page and graph visualization.
* **Hour 7:** Add WebSocket live updates and reconnection handling.
* **Hour 8:** Benchmark endpoint speed, finalize docs, and record Loom video.

## 3. Decision Record
* **Approach Taken:** Built a dedicated Django app `test` inside the CVAT backend querying database models directly via Django ORM aggregation.
* **Approach Rejected:** External standalone microservice (rejected due to unnecessary complexity in duplicating CVAT's internal JWT and permission mechanisms).