import Link from 'next/link';

export default function Custom404Page() {
    return (
        <main className="not-found-page">
            <style>{`
                .not-found-page {
                    min-height: 80vh;
                    background: #fffdf7;
                    color: #350008;
                    display: grid;
                    place-items: center;
                    padding: 120px 24px;
                    text-align: center;
                }

                .not-found-card {
                    max-width: 560px;
                }

                .not-found-code {
                    font-family: var(--font-pinyon), cursive;
                    font-size: 72px;
                    line-height: 1;
                    margin: 0 0 10px;
                    font-weight: 400;
                }

                .not-found-title {
                    font-family: var(--font-cormorant), serif;
                    font-size: 34px;
                    font-weight: 400;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin: 0 0 18px;
                }

                .not-found-text {
                    font-family: var(--font-hanken), sans-serif;
                    font-size: 10px;
                    font-weight: 400;
                    line-height: 18px;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin: 0 auto 34px;
                    max-width: 360px;
                }

                .not-found-link {
                    display: inline-block;
                    background: #350008;
                    color: #fffdf7;
                    text-decoration: none;
                    font-family: var(--font-hanken), sans-serif;
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 9px 34px;
                }
            `}</style>
            <section className="not-found-card">
                <p className="not-found-code">404</p>
                <h1 className="not-found-title">Page Not Found</h1>
                <p className="not-found-text">
                    The page you are looking for is unavailable or reserved for authorized access.
                </p>
                <Link href="/" className="not-found-link">Return Home</Link>
            </section>
        </main>
    );
}
