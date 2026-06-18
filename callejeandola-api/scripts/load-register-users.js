const API_URL = process.env.API_URL || "http://localhost:4000/api";

const totalUsers = Number(process.argv[2] || 50);
const concurrency = Number(process.argv[3] || 10);

const runId = Date.now();

function chunkArray(items, size) {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

async function registerUser(index) {
    const payload = {
        name: `Load Test Skater ${runId}-${index}`,
        email: `loadtest_${runId}_${index}@callejeandola.test`,
        password: "123456",
        country: "Costa Rica",
    };

    const startedAt = Date.now();

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => null);
        const durationMs = Date.now() - startedAt;

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                durationMs,
                email: payload.email,
                error: body?.error || body?.message || "Request failed",
            };
        }

        return {
            ok: true,
            status: response.status,
            durationMs,
            email: payload.email,
            role: body?.user?.role,
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            durationMs: Date.now() - startedAt,
            email: payload.email,
            error: error.message,
        };
    }
}

async function main() {
    console.log("Callejeandola register load test");
    console.log(`API_URL: ${API_URL}`);
    console.log(`Total users: ${totalUsers}`);
    console.log(`Concurrency: ${concurrency}`);
    console.log("");

    const indexes = Array.from({ length: totalUsers }, (_, index) => index + 1);
    const batches = chunkArray(indexes, concurrency);

    const results = [];

    console.time("Total duration");

    for (const [batchIndex, batch] of batches.entries()) {
        const batchResults = await Promise.all(batch.map(registerUser));
        results.push(...batchResults);

        const successCount = batchResults.filter((item) => item.ok).length;
        const failCount = batchResults.length - successCount;

        console.log(
            `Batch ${batchIndex + 1}/${batches.length}: ${successCount} ok, ${failCount} failed`
        );
    }

    console.timeEnd("Total duration");

    const successful = results.filter((item) => item.ok);
    const failed = results.filter((item) => !item.ok);

    const avgMs =
        successful.reduce((sum, item) => sum + item.durationMs, 0) /
        Math.max(successful.length, 1);

    console.log("");
    console.log("Summary");
    console.log(`Created: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Average success response: ${avgMs.toFixed(2)}ms`);

    if (failed.length) {
        console.log("");
        console.log("Failures:");
        failed.slice(0, 10).forEach((item) => {
            console.log(
                `- ${item.email} | status=${item.status} | error=${item.error}`
            );
        });

        process.exit(1);
    }
}

main();