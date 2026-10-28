# Performance Objectives

## System Environment
* **OS:** Linux / macOS
* **CVAT Commit SHA:** <a81ed252dce15b805d5a544116cf98005e42f257>

## MO-1: API Response Time Benchmark
* **Endpoint:** `GET /api/tasks/{task_id}/annotation-analytics/`
* **Target:** Median response time <= 250 ms.
* **Raw Benchmark Results (5 Runs):**
  1. Run 1: 185 ms
  2. Run 2: 142 ms
  3. Run 3: 138 ms
  4. Run 4: 151 ms
  5. Run 5: 146 ms
* **Median:** 146 ms
* **Status:** MET