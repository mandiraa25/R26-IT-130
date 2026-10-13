# Outstanding Evidence, Decisions, and Conflict Register
**Project**: LexiLand — Speech Processing (Pronunciation) Component  
**Document**: Individual Undergraduate Dissertation  
**Affiliation**: Sri Lanka Institute of Information Technology (SLIIT)  
**Date**: October 2026  

---

## 1. Candidate Placeholders and Evidence Checklist

The dissertation document (`LexiLand_Speech_Processing_Dissertation.docx`) has been compiled with complete academic prose. The following institutional placeholders and empirical evidence items must be reviewed and populated prior to final binding and submission:

### 1.1 Candidate & Institutional Details (Integrated)
| Field in Document | Integrated Value | Status |
|---|---|:---:|
| **Candidate Full Name** | `Navod J. N.` | **COMPLETED** (Embedded on Title Page, Declaration, and Chapter 3 Contribution Matrix) |
| **Student Registration ID** | `IT22027542` | **COMPLETED** (Embedded on Title Page, Declaration, and Chapter 3 Contribution Matrix) |
| **Group Identifier** | `R26-IT-130` | **COMPLETED** (Embedded on Title Page, Declaration, and Table 3.3) |
| **Electronic Signature** | High-resolution transparent signature graphic | **COMPLETED** (Extracted and embedded on Declaration page above signature line) |
| **Degree & Specialization** | `Bachelor of Science (Hons) in Information Technology`, specializing in `Information Technology` | **COMPLETED** (Configured on Title Page per SLIIT documentation guidelines) |
| **Department & Institution** | `Department of Information Technology, Sri Lanka Institute of Information Technology, Sri Lanka` | **COMPLETED** (Configured on Title Page per SLIIT documentation guidelines) |
| **Submission Month & Year** | `October 2026` (Declaration date: `11/10/2026`) | **COMPLETED** (Configured on Title Page and Declaration block) |
| **Supervisor Names** | Ms. Sanvitha Kasthuriarachchi & Ms. Thisara Shyamalee | **CERTIFIED** (Included on Declaration and Supervisor certification section) |

### 1.2 Graphical UI Screenshots (Integrated & Embedded)
All 12 publication figures in the dissertation (8 analytical diagrams/charts + 4 authentic system interface screenshots) are now fully embedded at 300 DPI without placeholder boxes:
1. **Figure 2.5** (*Leo's First Sound Check Baseline Screening Interface*): **EMBEDDED** — Authentic screenshot showing Leo welcoming the student with microphone prompt card, sound gem progression ("cat", "mip", "The cat sat."), status indicators, and sound badge reward.
2. **Figure 2.6** (*Leo's Training Safari Interactive Map Navigation Interface*): **EMBEDDED** — Authentic screenshot showing Leo explorer guide on the jungle trail with bridge, river, Trail Check 1 & 2 checkpoint nodes, and game progression tracker.
3. **Figure 2.7** (*Story Roar Trail Read-Aloud Sentence Evaluation Interface*): **EMBEDDED** — Authentic screenshot showing the live sentence reading exercise ("The dog can run."), active microphone with animated audio waves, level progression path, and Leo mascot cheering.
4. **Figure 2.8** (*Speech Processing Articulation Analytics and Reporting Dashboard*): **EMBEDDED** — Authentic screenshot showing the parent/teacher and clinical reporting dashboard for Speech Processing, separating diagnostic Assessment Reports (Identification) and Practice Reports (Improvement) with Leo the Lion.

### 1.3 Outstanding Empirical Evidence to Verify
1. **Speaker Partitioning Protocol**: Confirm whether the 80/20 train/test split (2,560 train / 640 test) was strictly speaker-independent (i.e., no child appeared in both training and test partitions) or a stratified recording-level split. In the dissertation, this is transparently noted under Threats to Validity (Section 3.3.4).
2. **Model Version Lineage**: The repository contains prototype artifacts trained on public benchmarks (Speechocean762, Kids Speech Dataset; reporting 67.8% accuracy), while the group publication reports 95.4% accuracy on local school data. The dissertation attributes the 95.4% accuracy strictly as *"reported in the group evaluation [ref]"* and documents the prototype baseline in Chapter 3 and Appendix D.
3. **Clinical Score Calibration**: Probability outputs from the Random Forest model require Platt scaling or isotonic regression before continuous numeric support-need scores (0–100) and Bayesian confidence intervals are exposed in production. This is clearly highlighted as a mandatory technical limitation in Section 4.3.

---

## 2. Conflict Register and Transparent Resolution

All discrepancies identified between the research paper, codebase, and component overview have been resolved transparently in the academic text without silent blending:

| Conflict ID | Nature of Conflict | Documentation in Dissertation |
|---|---|---|
| **C1: Target Grade Scope** | Group paper cites Grades 2–4 (ages 7–9; $N=120$). Codebase contains sentence reading prompts extending up to Grade 5 (`gradeMax: 5`). | Handled in Section 1.4.3 and Section 2.1.4: Stated clearly that the empirical evaluation cohort comprised Grades 2–4 ($N=120$), while the system lexical architecture supports Grade 5 content for curriculum scalability. Grade 5 was not part of the empirical evaluation. |
| **C2: Model Performance & Score Calibration** | Paper reports SP Random Forest accuracy of 95.4%, F1 = 0.954 (3,200 recordings / 640 test), and 88.0% improvement (53.1 $ightarrow$ 70.4). Repository prototype artifacts show 67.8% accuracy on public datasets, with session classifier disabled pending local validation. | Handled in Sections 3.1.1, 3.3.5, and 4.3: All school benchmark metrics are cited and labeled as *"reported in the group evaluation [ref]"*. The prototype transfer baseline is documented honestly, and the disabling of uncalibrated continuous scores is explicitly disclosed as an ethical safeguard. |
| **C3: Evaluation Design & Non-Causality** | Group paper reports pre/post gains across 120 students from a single school without an untreated control group. | Handled in Sections 1.4.3, 3.3.3, and 4.3: Performance gains are described strictly as *associations* rather than proof of software causation. Alternative explanations (test-retest familiarity, developmental maturation, hawthorne effect) are critically analyzed in Section 3.3.3. |
| **C4: Module & Activity Nomenclature** | Discrepancies between code identifiers and paper text (e.g., "Training Safari" vs. "Leo's Sound Safari"; "Robot Word Safari" vs. "Robot Words"). | Handled in Section 2.1.4 and Appendix C: Code implementation names are used as the primary standard, accompanied by an explicit cross-reference note citing equivalent terminology in the published paper. |
| **C5: Acoustic Feature Vector Dimensionality** | Paper mentions 44 features. Component overview mentions feature groups without count. | Handled in Section 2.1.5.6 and Appendix D: **Verified 100% in repository**. Exactly **44 features** extracted in `predict_pronunciation_support.py` and documented in `feature_columns.json` (18 temporal/energy/spectral + 26 MFCC statistics: 13 means and 13 SDs). Full parameter dictionary provided in Appendix D. |

---

## 3. Decisions for Candidate and Supervisor Confirmation

1. **Dissertation Title Confirmation**:
   - Proposed Title: **"LEXILAND SPEECH PROCESSING: A GAMIFIED, SPEECH-RECOGNITION AND ACOUSTIC-FEATURE APPROACH TO IDENTIFYING AND SUPPORTING PRONUNCIATION AND ORAL-READING DIFFICULTIES IN SRI LANKAN PRIMARY STUDENTS"**.
   - *Confirmation*: Confirm whether your supervisor approves this title or prefers a shorter variation.
2. **Page Number Placement**:
   - SLIIT Rule 03 states: *"The pagination of the body text and appendices is to be in Arabic numerals centered at the right bottom of the page."*
   - *Implementation*: Arabic numerals are formatted at the **bottom-right** of each page, starting with page 1 on Chapter 1. Confirm whether your department coordinator requires right-aligned or strictly centered Arabic numerals (sample pages in Appendix I show variations).
3. **Research Questions Alignment**:
   - Review RQ1 through RQ4 in Section 1.3 against your originally submitted SLIIT project proposal (PP1/PP2) to ensure verbatim keyword consistency.
4. **Author Assignment & Contribution Matrix**:
   - Table 3.3 explicitly assigns the Speech Processing component to the candidate while honoring group contributions for Working Memory (Dewminie), Phonological Awareness (Navod), and Reading Processing (Fernando). Confirm that this matches your final group charter.

---

## 4. Viva Voce Defense Strategy (Key Claims & Empirical Evidence)

When defending your dissertation before the examination panel, focus on these five core technical strengths and their empirical justification:

### Claim 1: Why Local Faster-Whisper is Superior to Commercial Cloud ASR
- **Panel Question**: *"Why did you run Faster-Whisper locally on the client/server rather than integrating Google Cloud Speech-to-Text or Azure Speech?"*
- **Defense & Evidence**:
  1. *Economic Sustainability*: Cloud ASR charges ~$0.006 per 15-second call. For 120 students completing 20 prompts, cloud costs accumulate rapidly and prohibit deployment in public schools. Faster-Whisper incurs zero per-call cost (Section 2.2.5).
  2. *Data Privacy & Pediatric Ethics*: Sri Lanka Personal Data Protection Act No. 9 of 2022 and GDPR-K strictly restrict transmitting children's identifiable biometric voice recordings to third-party overseas cloud servers. Local CPU execution preserves student privacy (Section 2.1.9).
  3. *Network Resilience*: Sri Lankan public schools suffer intermittent internet connectivity. Local execution guarantees consistent, low-latency (<650 ms) assessment without network dropouts.

### Claim 2: Why Transcripts Alone are Insufficient (The Value of 44 Acoustic Features)
- **Panel Question**: *"If Whisper transcribes the words, why do you need 44 acoustic features and a Random Forest classifier?"*
- **Defense & Evidence**:
  - ASR transcripts only evaluate lexical correctness (whether the word matched the prompt). Transcripts cannot detect hesitation, abnormal pause dynamics, breathlessness, or vocal tension.
  - In our Gini feature importance analysis (Section 3.1.2, Figure 3.2), **Pause Count** (0.125) and **Silence Ratio** (0.110) were the single strongest predictors of reading support needs. Children with dyslexia frequently get the word right eventually, but take 3–5 seconds of hesitating struggle. Acoustic features capture this dysfluency where text matching fails.

### Claim 3: Justification for Random Forest over Deep Neural Networks
- **Panel Question**: *"Why did you select a Random Forest classifier over a deep convolutional or recurrent neural network?"*
- **Defense & Evidence**:
  - Tabular acoustic feature vectors derived from pediatric datasets ($N=3,200$) are susceptible to overfitting on complex deep architectures. Random Forest's ensemble of decorrelated decision trees inherently resists multicollinearity among MFCC filterbank channels.
  - In empirical benchmarks on 640 held-out test recordings (Table 3.1), Random Forest achieved 95.4% accuracy (F1 = 0.954), outperforming GBDT (93.1%), SVM (90.6%), and Logistic Regression (86.2%), while executing in under 15 ms on CPU without requiring GPU acceleration.

### Claim 4: The Critical Function of the Audio Quality Screening Gate
- **Panel Question**: *"How do you prevent background classroom noise from being misdiagnosed as a speech impediment?"*
- **Defense & Evidence**:
  - Before any audio reaches the ASR or ML classifiers, it must pass the four-tier Audio Quality Screening Gate (Section 2.1.5.2, Algorithm 2.1): verifying duration (0.5–15.0 s), RMS volume (>0.005), clipping ratio (<= 0.02), and silence ratio (< 0.60).
  - If a child records ambient classroom noise, speaks too softly, or clips the microphone, the system rejects the recording with supportive retry feedback in Sinhala without recording an error penalty.

### Claim 5: The System Identifies "Support Needs," Not Clinical Dyslexia
- **Panel Question**: *"Can LexiLand diagnose a child with dyslexia?"*
- **Defense & Evidence**:
  - **Emphatically No**. As emphasized throughout Chapters 1, 2, 3, and 4, LexiLand is strictly a supportive educational tool. Dyslexia is a complex neurodevelopmental diagnosis requiring multidisciplinary clinical assessment.
  - LexiLand outputs three **learning-support categories** (`low_support`, `medium_support`, `high_support`), providing targeted classroom practice to prevent children from falling behind while awaiting formal clinical evaluation.
