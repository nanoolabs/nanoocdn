export const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NANOO CDN | EDGE ECOSYSTEMS</title>
    <meta name="description" content="NANOO CDN - high performance edge asset delivery on Cloudflare Workers and Backblaze B2">
    <link rel="icon" href="https://cdn.nanoolabs.dev/brands/latest/nanoo.svg">
    <link rel="stylesheet" href="/assets/cdn.css">
</head>
<body class="home">
    <header>
        <div class="brand">NANOO LABS</div>
        <div class="status-tag">SYSTEM OPERATIONAL</div>
    </header>

    <main>
        <div class="hero">
            <h1>High performance edge delivery network.</h1>
            <p>Optimize for low-latency asset distribution and secure origin-shielding using Cloudflare Workers and S3-compatible storage.</p>
        </div>

        <div class="specs">
            <div class="spec-item">
                <span class="label">Architecture</span>
                <span class="value">Edge Proxy</span>
            </div>
            <div class="spec-item">
                <span class="label">Protocol</span>
                <span class="value">AWS SigV4</span>
            </div>
            <div class="spec-item">
                <span class="label">Region</span>
                <span class="value">Global / Multi-zone</span>
            </div>
            <div class="spec-item">
                <span class="label">Latency</span>
                <span class="value">&lt; 10ms TTFB</span>
            </div>
        </div>
    </main>

    <footer>
        <div>&copy; 2026 NANOO LABS</div>
        <div>{{VERSION}}</div>
    </footer>
</body>
</html>
`

export const errorPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 | NOT FOUND</title>
    <link rel="icon" href="https://cdn.nanoolabs.dev/brands/latest/nanoo.svg">
    <link rel="stylesheet" href="/assets/cdn.css">
</head>
<body class="error">
    <div class="container">
        <div class="code">ERROR CODE: 404</div>
        <div class="message">RESOURCE NOT FOUND OR RESTRICTED [ ∅_∅ ]</div>
    </div>
</body>
</html>
`
