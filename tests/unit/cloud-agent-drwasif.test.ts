import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DrWasifAgent } from "../../src/lib/cloudAgent/agents/drwasif.ts";
import { CLOUD_AGENT_STATUS } from "../../src/lib/cloudAgent/types.ts";

describe("DrWasifAgent unit tests (bilingual support)", () => {
  const agent = new DrWasifAgent();
  const credentials = { apiKey: "fake-key" };

  test("providerId is 'drwasif'", () => {
    assert.equal(agent.providerId, "drwasif");
  });

  test("baseUrl is 'https://drwasif.online'", () => {
    assert.equal(agent.baseUrl, "https://drwasif.online");
  });

  test("createTask returns a valid initial CloudAgentTask", async () => {
    const params = {
      prompt: "My child has a mild fever",
      source: {
        repoName: "pediatrics-care",
        repoUrl: "https://drwasif.online",
      },
      options: {
        autoCreatePr: false,
        planApprovalRequired: false,
      },
    };

    const task = await agent.createTask(params, credentials);

    assert.ok(task.id.startsWith("task_"));
    assert.equal(task.providerId, "drwasif");
    assert.ok(task.externalId?.startsWith("drwasif_session_"));
    assert.equal(task.status, CLOUD_AGENT_STATUS.QUEUED);
    assert.equal(task.prompt, params.prompt);
    assert.equal(task.activities.length, 1);
    assert.ok(task.activities[0].content.includes("علامات موصول ہو گئیں۔"));
  });

  test("getStatus generates beautiful clinical fever recommendation (Bilingual)", async () => {
    const result = await agent.getStatus("fever-session", credentials);

    assert.equal(result.status, CLOUD_AGENT_STATUS.COMPLETED);
    assert.equal(result.externalId, "fever-session");

    // Assert English
    assert.ok(result.result?.summary?.includes("Fever / Temperature Evaluation Guide"));
    assert.ok(result.result?.summary?.includes("Mujahid Hospital"));
    assert.ok(result.result?.summary?.includes("+92 334 653 4004"));
    assert.ok(result.result?.summary?.includes("EasyPaisa"));

    // Assert Urdu
    assert.ok(result.result?.summary?.includes("بخار اور درجہ حرارت کی جانچ گائیڈ"));
    assert.ok(result.result?.summary?.includes("مجاہد ہسپتال"));
    assert.ok(result.result?.summary?.includes("ایزی پیسہ یا جاز کیش"));

    assert.equal(result.result?.duration, 30);
    assert.equal(result.result?.cost, 0);
  });

  test("getStatus generates beautiful clinical jaundice recommendation (Bilingual)", async () => {
    const result = await agent.getStatus("jaundice-newborn-session", credentials);

    assert.equal(result.status, CLOUD_AGENT_STATUS.COMPLETED);
    assert.ok(result.result?.summary?.includes("Newborn / Infant Normal Growth & Jaundice Check"));
    assert.ok(result.result?.summary?.includes("نوزائیدہ بچوں کی نشوونما اور یرقان کی جانچ"));
  });

  test("getStatus generates beautiful clinical diarrhea recommendation (Bilingual)", async () => {
    const result = await agent.getStatus("diarrhea-vomiting-session", credentials);

    assert.equal(result.status, CLOUD_AGENT_STATUS.COMPLETED);
    assert.ok(result.result?.summary?.includes("Diarrhea, Vomiting & Dehydration Assessment"));
    assert.ok(result.result?.summary?.includes("اسہال، الٹی اور پانی کی کمی کی جانچ"));
    assert.ok(result.result?.summary?.includes("Oral Rehydration Salts (ORS)"));
  });

  test("getStatus generates general clinical recommendation when no keywords match (Bilingual)", async () => {
    const result = await agent.getStatus("general-checkup", credentials);

    assert.equal(result.status, CLOUD_AGENT_STATUS.COMPLETED);
    assert.ok(result.result?.summary?.includes("General Pediatric Health & Growth Assessment"));
    assert.ok(result.result?.summary?.includes("بچوں کی عام صحت اور نشوونما کا جائزہ"));
    assert.ok(result.result?.summary?.includes("EPI Vaccination"));
  });

  test("sendMessage returns a valid clinical follow-up response (Bilingual)", async () => {
    const followUp = await agent.sendMessage("some-session", "He also has a slight cough", credentials);

    assert.ok(followUp.id.startsWith("act_"));
    assert.equal(followUp.type, "message");
    assert.ok(followUp.content.includes('He also has a slight cough'));
    assert.ok(followUp.content.includes('ڈاکٹر واصف نے آپ کی اضافی معلومات درج کر لی ہیں'));
  });

  test("listSources returns home page and interactive guides URLs", async () => {
    const sources = await agent.listSources(credentials);

    assert.equal(sources.length, 2);
    assert.equal(sources[0].name, "Dr Wasif Online Homepage");
    assert.equal(sources[0].url, "https://drwasif.online");
    assert.equal(sources[1].name, "Dr Wasif Interactive Guides");
    assert.equal(sources[1].url, "https://drwasif.online/blog.html");
  });

  test("approvePlan finishes without throwing", async () => {
    await assert.doesNotReject(async () => {
      await agent.approvePlan("some-session", credentials);
    });
  });
});
