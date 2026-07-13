export const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NANOO CDN | EDGE ECOSYSTEMS</title>
    <link rel="stylesheet" href="/assets/cdn.css">
    <style>
        body {
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 2rem;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid var(--border);
            padding-bottom: 1rem;
        }

        .brand {
            color: var(--text-bright);
            font-weight: 500;
        }

        .status-tag {
            color: var(--accent);
            text-transform: uppercase;
            font-size: 11px;
            font-weight: 600;
        }

        main {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .hero {
            max-width: 600px;
        }

        h1 {
            color: var(--text-bright);
            font-size: 2.5rem;
            font-weight: 500;
            line-height: 1;
            margin-bottom: 1.5rem;
            letter-spacing: -0.04em;
        }

        .specs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
            border-top: 1px solid var(--border);
            padding-top: 2rem;
        }

        .spec-item .label {
            display: block;
            text-transform: uppercase;
            font-size: 10px;
            margin-bottom: 0.5rem;
            color: var(--text);
            opacity: 0.5;
        }

        .spec-item .value {
            color: var(--text-bright);
            font-weight: 400;
        }

        footer {
            border-top: 1px solid var(--border);
            padding-top: 1rem;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            opacity: 0.4;
        }
    </style>
</head>
<body>
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
    <link rel="stylesheet" href="/assets/cdn.css">
    <style>
        body {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .container {
            border-left: 2px solid var(--accent);
            padding: 1rem 2rem;
        }

        .code {
            color: var(--accent);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .message {
            opacity: 0.5;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="code">ERROR CODE: 404</div>
        <div class="message">RESOURCE NOT FOUND OR RESTRICTED [ ∅_∅ ]</div>
    </div>
</body>
</html>
`
