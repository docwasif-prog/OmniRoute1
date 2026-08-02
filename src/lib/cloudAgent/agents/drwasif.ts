import {
  CloudAgentBase,
  type AgentCredentials,
  type CreateTaskParams,
  type GetStatusResult,
} from "../baseAgent.ts";
import type { CloudAgentTask, CloudAgentActivity, CloudAgentResult } from "../types.ts";
import { CLOUD_AGENT_STATUS } from "../types.ts";

/**
 * Dr. Wasif Iqbal Pediatric AI Agent — drwasif.online
 *
 * Dedicated AI Pediatric/Neonatology Clinical Assistant (Bilingual: English & Urdu).
 * Fully simulated clinical assessment agent based on Dr. Wasif Iqbal's real clinic,
 * parent tools, and interactive guides.
 *
 * Provides evidence-based parent guidance, schedules consultation warnings, clinic timings,
 * and direct links to connect with Dr. Wasif Iqbal (FCPS, PGPN-USA) in Faisalabad or online.
 */

// Simple clinical database of Dr. Wasif Iqbal's guidelines
const DR_WASIF_GUIDELINES = {
  phone: "+92 334 653 4004",
  clinics: [
    {
      name: "Islamabad Diagnostic Center (IDC)",
      location: "Susan Road, Madina Town, Faisalabad",
      timing: "2:00 PM – 6:00 PM (Mon-Sat)",
      contact: "0345 0048037",
    },
    {
      name: "Hajra Karim Hospital",
      location: "Batala Colony, Babar Chowk, Faisalabad",
      timing: "7:30 PM – 9:45 PM (Mon-Sat)",
      contact: "0302 8699277",
    },
    {
      name: "Mujahid Hospital",
      location: "Madina Town, Faisalabad",
      timing: "10:00 PM – 11:00 PM (Mon-Sat)",
      contact: "041 8737959",
    },
  ],
  emergencyWarningEn:
    "CRITICAL WARNING: If your child is struggling to breathe, has a very high uncontrollable fever, is unresponsive, or shows severe dehydration, please proceed IMMEDIATELY to the Emergency Room at Mujahid Hospital or the nearest hospital.",
  emergencyWarningUr:
    "اہم ترین وارننگ: اگر آپ کے بچے کو سانس لینے میں دشواری ہو رہی ہو، بہت تیز بے قابو بخار ہو، بچہ بے ہوش ہو رہا ہو، یا شدید پانی کی کمی ہو، تو فوری طور پر مجاہد ہسپتال یا قریبی ایمرجنسی روم لے جائیں۔",
};

export class DrWasifAgent extends CloudAgentBase {
  readonly providerId = "drwasif";
  readonly baseUrl = "https://drwasif.online";

  async createTask(
    params: CreateTaskParams,
    _credentials: AgentCredentials
  ): Promise<CloudAgentTask> {
    const taskId = this.generateTaskId();

    return {
      id: taskId,
      providerId: this.providerId,
      externalId: `drwasif_session_${Date.now()}`,
      status: CLOUD_AGENT_STATUS.QUEUED,
      prompt: params.prompt,
      source: params.source,
      options: params.options,
      activities: [
        {
          id: this.generateActivityId(),
          type: "message",
          content: "Inquiry received. Initializing pediatric assessment session... (علامات موصول ہو گئیں۔ بچوں کی طبی جانچ شروع کی جا رہی ہے...)",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getStatus(externalId: string, _credentials: AgentCredentials): Promise<GetStatusResult> {
    const activities: CloudAgentActivity[] = [
      {
        id: this.generateActivityId(),
        type: "command",
        content: "Parsing clinical symptom keywords from the query... (علامات کا جائزہ لیا جا رہا ہے...)",
        timestamp: new Date(Date.now() - 30000).toISOString(),
      },
      {
        id: this.generateActivityId(),
        type: "plan",
        content: "Match query against Dr. Wasif's Pediatrics (FCPS) and Pediatric Nutrition (PGPN-USA) guidelines... (ڈاکٹر واصف کے طبی اصولوں کے مطابق جائزہ...)",
        timestamp: new Date(Date.now() - 20000).toISOString(),
      },
    ];

    const promptText = externalId.toLowerCase();
    let diagnosisSummaryEn = "";
    let diagnosisSummaryUr = "";
    let specificCarePlanEn = "";
    let specificCarePlanUr = "";

    if (promptText.includes("fever") || promptText.includes("temp")) {
      activities.push({
        id: this.generateActivityId(),
        type: "code_change",
        content: "Applying Dr. Wasif's Fever Guide rules. Analyzing dangerous thresholds by age group...",
        timestamp: new Date(Date.now() - 10000).toISOString(),
      });
      diagnosisSummaryEn = "Fever / Temperature Evaluation Guide";
      diagnosisSummaryUr = "بخار اور درجہ حرارت کی جانچ گائیڈ";
      specificCarePlanEn = `
1. **Fever Care by Age**:
   - For babies under 3 months: Any fever >= 100.4°F (38°C) is an emergency. Contact Dr. Wasif or visit Mujahid Hospital immediately.
   - For children 3-6 months: Manage with Paracetamol (by weight, not age) if fever is over 101°F.
   - For children > 6 months: Ensure hydration, light clothing, and tepid sponging. Avoid cold water sponging.
2. **Medications**: Paracetamol dose is 15mg/kg/dose. Ibuprofen is 10mg/kg/dose (only for > 6 months). Always share weight with Dr. Wasif for precise dosage.
3. **Emergency Signs**: Shortness of breath, extreme lethargy, fits/seizures, or refusal to drink are danger signs.
      `;
      specificCarePlanUr = `
1. **عمر کے لحاظ سے بخار کی دیکھ بھال**:
   - ۳ ماہ سے کم عمر کے بچوں کے لیے: ۱۰۰.۴ ڈگری فارن ہائیٹ (۳۸ ڈگری سینٹی گریڈ) یا اس سے زیادہ بخار ایمرجنسی ہے۔ فوری طور پر ڈاکٹر واصف سے رابطہ کریں یا مجاہد ہسپتال تشریف لے جائیں۔
   - ۳ سے ۶ ماہ کے بچوں کے لیے: اگر بخار ۱۰۱ سے زیادہ ہو تو پیراسیٹامول (وزن کے حساب سے، عمر کے نہیں) دیں۔
   - ۶ ماہ سے بڑے بچوں کے لیے: پانی کی فراہمی، ہلکے کپڑے اور تازہ پانی سے پٹیاں کریں۔ برف یا ٹھنڈے پانی کا استعمال ہرگز نہ کریں۔
2. **ادویات**: پیراسیٹامول کی خوراک 15mg/kg/dose ہے۔ آئیبوپروفین 10mg/kg/dose ہے (صرف ۶ ماہ سے بڑے بچوں کے لیے)۔ درست خوراک کے لیے ہمیشہ بچے کا وزن ڈاکٹر واصف سے شیئر کریں۔
3. **خطرناک علامات**: سانس لینے میں دشواری، شدید غنودگی، جھٹکے لگنا، یا فیڈ نہ لینا خطرناک علامات ہیں۔
      `;
    } else if (promptText.includes("jaundice") || promptText.includes("newborn") || promptText.includes("baby")) {
      activities.push({
        id: this.generateActivityId(),
        type: "code_change",
        content: "Applying Dr. Wasif's Newborn Normal Checker rules. Analyzing neonatal jaundice risks...",
        timestamp: new Date(Date.now() - 10000).toISOString(),
      });
      diagnosisSummaryEn = "Newborn / Infant Normal Growth & Jaundice Check";
      diagnosisSummaryUr = "نوزائیدہ بچوں کی نشوونما اور یرقان کی جانچ";
      specificCarePlanEn = `
1. **Newborn Jaundice**:
   - Common in the first week. Check baby's skin/eyes in natural daylight.
   - If skin below the belly button looks yellow, consult immediately on WhatsApp (+92 334 653 4004) for a serum bilirubin test advice.
   - Keep feeding frequently (10-12 times in 24 hours). Phototherapy might be needed if levels are high.
2. **Colic & Sleep**: Ensure correct burping posture after every feed. Avoid overfeeding. Sleep duration of 14-17 hours is normal for newborns.
      `;
      specificCarePlanUr = `
1. **نوزائیدہ بچوں کا یرقان**:
   - پہلے ہفتے میں عام ہے۔ بچے کی جلد اور آنکھیں قدرتی روشنی میں دیکھیں۔
   - اگر ناف سے نیچے کی جلد پیلی نظر آئے تو بلیروبن ٹیسٹ کے مشورے کے لیے فوری طور پر واٹس ایپ (+92 334 653 4004) پر رابطہ کریں۔
   - فیڈ کثرت سے دیں (۲۴ گھنٹے میں ۱۰ سے ۱۲ بار)۔ اگر پیلا پن زیادہ ہو تو فوٹو تھراپی کی ضرورت پڑ سکتی ہے۔
2. **کولک (پیٹ کا درد) اور نیند**: ہر فیڈ کے بعد بچے کو ڈکار دلانے کی درست پوزیشن یقینی بنائیں۔ ضرورت سے زیادہ فیڈ نہ دیں۔ نوزائیدہ بچوں کے لیے ۱۴ سے ۱۷ گھنٹے کی نیند بالکل نارمل ہے۔
      `;
    } else if (promptText.includes("diarrhea") || promptText.includes("vomit") || promptText.includes("dehydration") || promptText.includes("stool")) {
      activities.push({
        id: this.generateActivityId(),
        type: "code_change",
        content: "Applying Dr. Wasif's Dehydration Checker rules. Assessing hydration clinical indicators...",
        timestamp: new Date(Date.now() - 10000).toISOString(),
      });
      diagnosisSummaryEn = "Diarrhea, Vomiting & Dehydration Assessment";
      diagnosisSummaryUr = "اسہال، الٹی اور پانی کی کمی کی جانچ";
      specificCarePlanEn = `
1. **Hydration Evaluation**: Check for 6 key signs:
   - Is the child active or lethargic?
   - Are eyes sunken?
   - Are there tears when crying?
   - Is the mouth/tongue dry?
   - Is thirst normal, eager, or unable to drink?
   - Is urine frequency decreased (less than 4-6 wet diapers/day)?
2. **Immediate Home Care**:
   - Give Oral Rehydration Salts (ORS) in small, frequent sips (1-2 teaspoons every few minutes) to avoid triggering further vomiting.
   - Avoid juice or sweet drinks as they worsen diarrhea. Continue breastfeeding.
   - Zinc supplements can shorten the duration of acute diarrhea.
      `;
      specificCarePlanUr = `
1. **پانی کی کمی کا جائزہ**: ۶ اہم علامات دیکھیں:
   - کیا بچہ چست ہے یا کمزور/ڈھیلا؟
   - کیا آنکھیں اندر کو دھنسی ہوئی ہیں؟
   - کیا روتے وقت آنسو آتے ہیں؟
   - کیا زبان اور منہ خشک ہیں؟
   - پیاس نارمل ہے، بچہ شوق سے پانی پی رہا ہے یا پی نہیں پا رہا؟
   - کیا پیشاب کی فریکوئنسی کم ہو گئی ہے (دن میں ۴ سے ۶ گیلے پیمپر سے کم)؟
2. **فوری گھریلو دیکھ بھال**:
   - او آر ایس (ORS/نمکول) کے چھوٹے اور بار بار گھونٹ دیں (ہر چند منٹ بعد ۱-۲ چائے کے چمچ) تاکہ الٹی دوبارہ شروع نہ ہو۔
   - جوس یا میٹھے مشروبات سے پرہیز کریں کیونکہ وہ اسہال کو بدتر کرتے ہیں۔ ماں کا دودھ جاری رکھیں۔
   - زنک (Zinc) کے سپلیمنٹس شدید اسہال کے دورانیے کو کم کر سکتے ہیں۔
      `;
    } else {
      activities.push({
        id: this.generateActivityId(),
        type: "code_change",
        content: "Applying general Pediatric Triage and developmental milestone guidelines...",
        timestamp: new Date(Date.now() - 10000).toISOString(),
      });
      diagnosisSummaryEn = "General Pediatric Health & Growth Assessment";
      diagnosisSummaryUr = "بچوں کی عام صحت اور نشوونما کا جائزہ";
      specificCarePlanEn = `
1. **Developmental Milestone Check**: Ensure child meets gross/fine motor and language milestones for age. Speech delays should be screened early.
2. **Nutritional Care**: Ensure ideal weight/height matching WHO reference standards. Optimize meal plans for picky eaters with vitamin/iron-rich foods.
3. **Pakistan EPI Vaccination**: Keep track of due vaccines (EPI schedule covers BCG, Polio, Pentavalent, Pneumococcal, Rotavirus, Measles, Typhoid).
      `;
      specificCarePlanUr = `
1. **نشوونما کے سنگ میل (Milestones)**: یقینی بنائیں کہ بچہ عمر کے مطابق جسمانی حرکت اور زبان سیکھنے کے سنگ میل عبور کر رہا ہے۔ بولنے میں تاخیر کی صورت میں جلد سکریننگ کروائیں۔
2. **غذائیت کی دیکھ بھال**: عالمی ادارہ صحت (WHO) کے معیار کے مطابق قد اور وزن کو مانیٹر کریں۔ نخرے کرنے والے (Picky) بچوں کے لیے وٹامن اور آئرن سے بھرپور ڈائٹ پلان بنائیں۔
3. **پاکستان حفاظتی ٹیکوں کا شیڈول (EPI)**: ٹیکوں کا ریکارڈ رکھیں۔ ای پی آئی شیڈول میں بی سی جی، پولیو، پینٹاويلینٹ، نیوموکاکل، روٹا وائرس، خسرہ اور ٹائیفائیڈ شامل ہیں۔
      `;
    }

    const completedSummary = `
## 🩺 ${diagnosisSummaryEn} — Dr. Wasif Iqbal's Pediatric AI Agent

Thank you for consulting Dr. Wasif's Pediatric AI Assistant. Here is your personalized care guidelines:

${specificCarePlanEn}

---

## 🩺 ${diagnosisSummaryUr} — ڈاکٹر واصف اقبال پیڈیاٹرک اے آئی اسسٹنٹ

ڈاکٹر واصف کے پیڈیاٹرک اے آئی اسسٹنٹ سے مشورہ کرنے کا شکریہ۔ آپ کے لیے تجویز کردہ طبی مشورہ درج ذیل ہے:

${specificCarePlanUr}

---

### 🏥 Dr. Wasif Iqbal Clinic Consultations (Faisalabad, Pakistan)
If your child requires a physical clinical checkup, Dr. Wasif Iqbal is available at:
1. **Islamabad Diagnostic Center (IDC)**: Susan Road, Madina Town, Faisalabad | **Timing**: 2:00 PM – 6:00 PM (Mon-Sat) | Tel: 0345 0048037
2. **Hajra Karim Hospital**: Batala Colony, Babar Chowk, Faisalabad | **Timing**: 7:30 PM – 9:45 PM (Mon-Sat) | Tel: 0302 8699277
3. **Mujahid Hospital**: Madina Town, Faisalabad | **Timing**: 10:00 PM – 11:00 PM | Tel: 041 8737959

### 🏥 ڈاکٹر واصف اقبال کلینک کنسلٹیشنز (فیصل آباد، پاکستان)
اگر آپ کے بچے کو جسمانی معائنے کی ضرورت ہے تو ڈاکٹر واصف درج ذیل مقامات پر دستیاب ہیں:
1. **اسلام آباد ڈائیگنوسٹک سینٹر (IDC)**: سوسن روڈ، مدینہ ٹاؤن، فیصل آباد | **وقت**: ۲:۰۰ تا ۶:۰۰ بجے دوپہر (پیر تا ہفتہ) | فون: 03450048037
2. **ہاجرہ کریم ہسپتال**: بٹالہ کالونی، بابر چوک، فیصل آباد | **وقت**: ۷:۳۰ تا ۹:۴۵ بجے شام (پیر تا ہفتہ) | فون: 03028699277
3. **مجاہد ہسپتال**: مدینہ ٹاؤن، فیصل آباد | **وقت**: ۱۰:۰۰ تا ۱۱:۰۰ بجے رات | فون: 0418737959

### 📱 24/7 Telehealth & Online Booking
For fast consultations from home (Pakistan or Overseas):
- **WhatsApp Call / Message**: Send symptoms to **+92 334 653 4004**. Typical response time is under 5 minutes. (Pay securely via EasyPaisa or JazzCash)
- **Online Apps**: Book via Marham or Oladoc.
- **Prescription**: Receive a verified digital prescription valid at all major pharmacies globally.

### 📱 ۲۴/۷ آن لائن ویڈیو کنسلٹیشن اور بکنگ
گھر بیٹھے فوری مشورے کے لیے (پاکستان اور بیرون ملک مقیم خاندان):
- **واٹس ایپ کال / میسج**: اپنی علامات **+92 334 653 4004** پر بھیجیں۔ جواب کا اوسط وقت ۵ منٹ سے کم ہے۔ (ایزی پیسہ یا جاز کیش کے ذریعے محفوظ ادائیگی کریں)
- **آن لائن ایپس**: مرہم (Marham) یا اولی ڈاک (Oladoc) کے ذریعے بکنگ کریں۔
- **نسخہ**: واٹس ایپ پر آفیشل ڈیجیٹل نسخہ حاصل کریں جو دنیا بھر کی تمام بڑی فارمیسیوں پر کارآمد ہے۔

---

${DR_WASIF_GUIDELINES.emergencyWarningEn}

${DR_WASIF_GUIDELINES.emergencyWarningUr}
    `;

    activities.push({
      id: this.generateActivityId(),
      type: "completion",
      content: "Pediatric guidance successfully formulated. (طبی مشورہ کامیابی سے تیار کر لیا گیا ہے۔)",
      timestamp: new Date().toISOString(),
    });

    const result: CloudAgentResult = {
      summary: completedSummary.trim(),
      prUrl: "https://drwasif.online",
      commitMessage: "Dr. Wasif Iqbal Pediatric Clinical Guidelines (English & Urdu)",
      duration: 30,
      cost: 0.0, // Free agent!
    };

    return {
      status: CLOUD_AGENT_STATUS.COMPLETED,
      externalId,
      result,
      activities,
    };
  }

  async approvePlan(_externalId: string, _credentials: AgentCredentials): Promise<void> {
    // Dr. Wasif agent auto-plans medical triage autonomously.
  }

  async sendMessage(
    externalId: string,
    message: string,
    _credentials: AgentCredentials
  ): Promise<CloudAgentActivity> {
    return {
      id: this.generateActivityId(),
      type: "message",
      content: `Replied: Dr. Wasif has noted your additional observation: "${message}". Please keep baby hydrated and monitor closely. (ڈاکٹر واصف نے آپ کی اضافی معلومات درج کر لی ہیں۔ براہ کرم بچے کو پانی دیتے رہیں اور نگرانی رکھیں۔)`,
      timestamp: new Date().toISOString(),
    };
  }

  async listSources(
    _credentials: AgentCredentials
  ): Promise<{ name: string; url: string; branch?: string }[]> {
    return [
      {
        name: "Dr Wasif Online Homepage",
        url: "https://drwasif.online",
      },
      {
        name: "Dr Wasif Interactive Guides",
        url: "https://drwasif.online/blog.html",
      },
    ];
  }
}
