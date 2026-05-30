# Nanoo CDN Architecture

This document shows how the system works and how requests move through it, maybe in the future there will be improve

## How the worker processes a request

This diagram shows the steps the Worker takes for each new request. It also shows how the cache helps to make it faster.

```mermaid
graph TD
    A[User Request] --> B{Method GET/HEAD?}
    B -- No --> C[Return 405 Method Not Allowed]
    B -- Yes --> D[Generate cacheKey]

    D --> E{Cache HIT?}
    E -- Yes --> F[Return Cached Response]
    E -- No --> G[Clean the URL Path]

    G --> H{List Bucket Request?}
    H -- Yes --> I[Return 404/Forbidden]
    H -- No --> J[Sign Request for Security]

    J --> K{Range Header Present?}
    K -- Yes --> L[Fetch from B2 with Retries]
    K -- No --> M[Fetch from B2]

    L --> N{Response OK?}
    M --> N

    N -- Yes --> O[Save to Edge Cache]
    O --> P[Return File to User]
    N -- No --> Q[Return Error Response]
```

## Step by step request flow

This diagram shows how the User, Cloudflare, and backblaze B2 talk to each other.

```mermaid
sequenceDiagram
    participant U as User
    participant E as Cloudflare Edge Cache
    participant W as Worker (src/index.js)
    participant B as Backblaze B2 (Origin)

    U->>E: GET /assets/nanoo_logo.png
    alt Cache HIT
        E-->>U: Return File (It's Very Fast)
    else Cache MISS
        E->>W: Forward Request
        W->>W: Clean Path & Headers
        W->>W: Sign Request for Security
        W->>B: Send Request to B2
        B-->>W: 200 OK / 206 Partial Content
        W->>E: Save File to Cache
        W-->>U: Return File
    end
```

## Project Parts

- **`src/index.js`**: **Main controller**
- **`src/lib/signer.js`**: **Security handler**
- **`src/lib/cache.js`**: **Speed manager**
- **`src/lib/utils.js`**: **Helper tools**
