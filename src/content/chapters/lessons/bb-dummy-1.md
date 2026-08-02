# Load Balancers: A Comprehensive Guide

## Table of Contents

1.  Introduction
2.  Why Load Balancing Matters
3.  Core Concepts
4.  Types of Load Balancers
5.  Layer 4 vs Layer 7
6.  Load Balancing Algorithms
7.  Health Checks
8.  Session Persistence
9.  High Availability
10. SSL/TLS Termination
11. Reverse Proxy vs Load Balancer
12. Global Server Load Balancing
13. Cloud Load Balancers
14. Scaling Strategies
15. Common Architectures
16. Failure Scenarios
17. Monitoring & Metrics
18. Security Considerations
19. Real-World Examples
20. Interview Questions
21. Best Practices
22. Summary

# 1. Introduction

A load balancer distributes incoming client requests across multiple
backend servers to improve availability, scalability, performance, and
fault tolerance. Without a load balancer, a single server becomes a
bottleneck and a single point of failure.

# 2. Why Load Balancing Matters

Modern applications receive traffic from thousands or millions of users.
Load balancers prevent overload by spreading requests evenly and
removing unhealthy instances from service.

Benefits include:

-   Improved availability
-   Horizontal scalability
-   Better latency
-   Zero-downtime deployments
-   Fault tolerance
-   Centralized SSL termination
-   Security controls

# 3. Core Concepts

A load balancer sits between clients and application servers.

Client -\> Load Balancer -\> Backend Pool

The load balancer receives requests, chooses a healthy backend, forwards
the request, and returns the response.

# 4. Types of Load Balancers

## Hardware

Dedicated appliances used in enterprise environments.

## Software

Examples include NGINX, HAProxy, Envoy, and Traefik.

## Cloud Managed

AWS ALB/NLB, Azure Load Balancer, Google Cloud Load Balancing.

# 5. Layer 4 vs Layer 7

Layer 4 operates on TCP/UDP and forwards packets based on IP addresses
and ports.

Layer 7 understands HTTP, URLs, cookies, headers, and can perform
intelligent routing.

# 6. Load Balancing Algorithms

-   Round Robin
-   Weighted Round Robin
-   Least Connections
-   Least Response Time
-   Random
-   IP Hash
-   Consistent Hashing
-   Weighted Least Connections

Each algorithm has trade-offs depending on workload and server capacity.

# 7. Health Checks

Health checks periodically verify backend health using TCP, HTTP, HTTPS,
or custom endpoints.

Unhealthy servers are automatically removed until recovery.

# 8. Session Persistence

Sticky sessions ensure the same client continues communicating with the
same backend.

Methods include:

-   Cookies
-   Source IP
-   Session IDs

# 9. High Availability

Production deployments usually place multiple load balancers behind a
virtual IP or DNS with failover.

# 10. SSL/TLS Termination

The load balancer decrypts HTTPS traffic before forwarding requests
internally, reducing CPU usage on backend servers.

# 11. Reverse Proxy vs Load Balancer

A reverse proxy can route requests and hide backend servers. Many modern
reverse proxies also provide load balancing.

# 12. Global Server Load Balancing

Traffic is routed to geographically closest or healthiest regions using
DNS or Anycast.

# 13. Cloud Load Balancers

AWS: - ALB - NLB - Gateway Load Balancer

Google Cloud: - Global HTTP(S) LB - TCP/UDP LB

Azure: - Application Gateway - Azure Load Balancer

# 14. Scaling Strategies

-   Horizontal Scaling
-   Auto Scaling
-   Blue/Green Deployment
-   Canary Releases

# 15. Common Architectures

Internet → CDN → WAF → Load Balancer → API Gateway → Application Servers
→ Cache → Database

# 16. Failure Scenarios

-   Backend crash
-   Network partition
-   Load balancer overload
-   Health check failures
-   Slow servers
-   Zone outage

Mitigations include redundancy, retries, circuit breakers, and
autoscaling.

# 17. Monitoring & Metrics

Important metrics:

-   Requests/sec
-   Active connections
-   Error rate
-   Latency
-   Backend health
-   Queue depth
-   CPU & Memory

# 18. Security Considerations

-   DDoS protection
-   WAF integration
-   TLS termination
-   Rate limiting
-   IP filtering
-   Header validation

# 19. Real-World Examples

Netflix, Amazon, Google, Meta, and banking systems all use multiple
layers of load balancing for regional traffic distribution and
resilience.

# 20. Interview Questions

1.  Difference between Layer 4 and Layer 7?
2.  What is sticky session?
3.  Explain least-connections.
4.  What happens when a backend fails?
5.  Why use health checks?
6.  Explain consistent hashing.
7.  When should you terminate SSL?
8.  Why use Anycast?

# 21. Best Practices

-   Avoid single points of failure
-   Enable health checks
-   Monitor continuously
-   Prefer stateless services
-   Use autoscaling
-   Configure timeouts
-   Tune connection pools
-   Test failover regularly

# 22. Summary

Load balancers are a foundational component of distributed systems. They
improve availability, scalability, reliability, and performance by
intelligently distributing traffic across healthy backend servers while
enabling advanced capabilities such as SSL termination, intelligent
routing, traffic shaping, and zero-downtime deployments.
