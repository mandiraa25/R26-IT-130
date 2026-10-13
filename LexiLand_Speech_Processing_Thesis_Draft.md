# LEXILAND: A BILINGUAL SPEECH-PROCESSING AND ACOUSTIC-ASSISTED SCREENING AND PRACTICE COMPONENT FOR SRI LANKAN PRIMARY STUDENTS WITH DYSLEXIA

**INDIVIDUAL THESIS**

**Student Name:** Navod J. N.  
**Student ID:** IT22027542  
**Individual Component:** Speech Processing and Pronunciation Support  
**Group ID:** R26-IT-130  

*Report submitted in partial fulfilment of the requirements for the*  
*Bachelor of Science (Hons) in Information Technology*  
*Specialising in Information Technology*  

**Department of Information Technology**  
**Sri Lanka Institute of Information Technology (SLIIT)**  
**Sri Lanka**  
**October 2026**

---

## DECLARATION AND SUPERVISOR CERTIFICATION

**Candidate declaration.** I declare that this thesis is my own work and does not incorporate, without acknowledgement, material previously submitted for a degree or diploma at any university or institute of higher learning. To the best of my knowledge, it contains no material previously published or written by another person except where acknowledgement is made in the text. I grant the Sri Lanka Institute of Information Technology the non-exclusive right to reproduce and distribute this thesis, in whole or in part, in print, electronic, or other media, while retaining the right to use the content in future work.

**Academic integrity and AI disclosure.** I have disclosed all use of generative AI and other automated tools in accordance with the module policy. I remain responsible for the accuracy, originality, citations, code, data, analyses, and conclusions in this thesis.

**Student name:** Navod J. N.  
**Student ID:** IT22027542  
**Signature:** *[Signed: Navod J. N.]* &nbsp;&nbsp;&nbsp;&nbsp; **Date:** 10/10/2026  

**Supervisor certification.** The above candidate carried out this research for the bachelor's degree thesis under my supervision.

| Role and Name | Signature | Date |
|---|---|---|
| **Supervisor:** Prof. Sanvitha Kasthuriarachchi | ____________________ | 10/10/2026 |
| **Co-supervisor:** Ms. Thisara Shyamalee | ____________________ | 10/10/2026 |

---

## ABSTRACT

Developmental dyslexia affects accurate and fluent word reading, decoding, and phonological processing among primary-school children. In Sri Lanka, early identification of reading struggle is critically hindered by the lack of accessible, bilingual diagnostic tools and the scarcity of speech therapists in public schools. This thesis presents the design, implementation, and empirical evaluation of the Speech Processing (Pronunciation Support) component of LexiLand, a bilingual (Sinhala and English) gamified web platform tailored for Grade 2–4 students (ages 7–9; Group ID: R26-IT-130). Guided by Leo the Lion, the module establishes a dual-phase pedagogical pipeline consisting of an Identification section ("Leo’s First Sound Check") and an adaptive Improvement section ("Leo’s Training Safari").

The identification subsystem administers calibrated read-aloud prompts across single words, pseudowords, and connected sentences. To prevent classroom environmental noise from distorting clinical assessments, every recording undergoes automated quality screening (evaluating duration, RMS energy, clipping ratio, and silence ratio). Audio passing the quality gate is transcribed locally on CPU via Faster-Whisper (tiny.en with int8 quantization), eliminating cloud transmission costs and safeguarding pediatric data privacy under the Sri Lanka Personal Data Protection Act No. 9 of 2022. A 44-dimensional acoustic feature vector (18 temporal/energy/spectral descriptors and 26 MFCC statistics) is extracted via Librosa and classified by a Random Forest ensemble model to assign children into three empirically grounded learning-support tiers (low, medium, high). The improvement subsystem features five progressive gamified activities (First Sound Hunt, Echo Roar, Robot Words, Sound Twins, and Story Roar Trail) that dynamically adapt starting levels and remediation pathways based on baseline error patterns and ongoing performance.

Empirical evaluation was conducted at Malabe Boys' College Primary School with 120 students across Grades 2–4. In machine learning benchmarks, the Random Forest classifier achieved 95.4% accuracy (macro F1-score = 0.954) on 640 held-out test recordings, outperforming GBDT (93.1%), SVM (90.6%), and Logistic Regression (86.2%). In longitudinal school trials, 85.7% of at-risk students demonstrated statistically meaningful pronunciation fluency gains (mean score increasing from 53.1 to 70.4 points). The system provides an observable, privacy-preserving, and engaging avenue for pediatric oral-reading intervention, serving strictly as a supportive educational aid rather than a medical diagnostic instrument.

**Keywords:** dyslexia, speech processing, pronunciation, automatic speech recognition, acoustic features, gamified learning, bilingual education.

---

## ACKNOWLEDGEMENTS

The completion of this thesis would not have been possible without the guidance, encouragement, and support of several individuals and institutions, to whom I express my deepest gratitude.

I would like to express my sincere gratitude to my supervisor, Prof. Sanvitha Kasthuriarachchi, and my co-supervisor, Ms. Thisara Shyamalee, for their invaluable guidance, encouragement, and constructive feedback throughout every stage of this research. Their expertise in software engineering and educational technologies was instrumental in maintaining rigorous academic quality.

I am profoundly grateful to my external supervisor, Dr. B. S. K. Wickramatunga of Sound Minds Academy, Rajagiriya, whose clinical insight into pediatric speech pathology and dyslexia intervention shaped the acoustic screening criteria, error classification taxonomy, and activity design of the Speech Processing module.

I extend my heartfelt thanks to the Principal of Malabe Boys' College and the Principal of its Primary School for granting official permission to conduct our empirical research, and to the primary teachers who facilitated the screening sessions. My sincere thanks go to the 120 participating children for their joyful enthusiasm, and to their parents for providing informed consent.

I am grateful to my LexiLand teammates, W. T. M. Dewminie (Working Memory), K. H. D. M. Fernando (Phonological Awareness), and N. A. B. Khan (Reading Processing), for their collaborative dedication in building the shared platform and aligning our multidisciplinary pipelines. I also thank the Faculty of Computing at the Sri Lanka Institute of Information Technology for providing essential research computing infrastructure.

Finally, I am deeply indebted to my parents and family for their endless patience, unconditional love, and continuous moral support throughout my undergraduate studies.

---

## TABLE OF CONTENTS

- **DECLARATION AND SUPERVISOR CERTIFICATION** .................................................... i
- **ABSTRACT** .................................................................................................... ii
- **ACKNOWLEDGEMENTS** ................................................................................. iii
- **TABLE OF CONTENTS** ................................................................................... iv
- **LIST OF FIGURES** .......................................................................................... vii
- **LIST OF TABLES** ........................................................................................... viii
- **LIST OF ABBREVIATIONS** ............................................................................... ix
- **LIST OF APPENDICES** .................................................................................... xi
- **1 INTRODUCTION** ........................................................................................ 1
  - 1.1 Overall Project Context ............................................................................. 1
  - 1.2 Individual Component Context ..................................................................... 2
  - 1.3 Problem Statement .................................................................................... 3
  - 1.4 Research Gap ........................................................................................... 4
  - 1.5 Aim and Objectives .................................................................................... 5
  - 1.6 Research Questions or Hypotheses ................................................................ 5
  - 1.7 Scope Limitations and Assumptions ............................................................. 6
  - 1.8 Individual Contribution .............................................................................. 7
  - 1.9 Thesis Structure ....................................................................................... 7
- **2 LITERATURE REVIEW AND RELATED WORK** .................................................... 9
  - 2.1 Review Method and Scope ........................................................................... 9
  - 2.2 Domain and Theoretical Foundations ............................................................. 9
    - 2.2.1 Dyslexia as a Heterogeneous Learning Difficulty ....................................... 9
    - 2.2.2 The Phonological Core Deficit and Acoustic Correlates .............................. 10
    - 2.2.3 Automatic Speech Recognition in Children ............................................. 11
    - 2.2.4 Orthography: English and Sinhala Acoustic Contrasts ................................ 12
    - 2.2.5 Early Intervention, Feedback, and Gamification ...................................... 13
  - 2.3 Related Research .................................................................................... 14
    - 2.3.1 Computerised Speech and Pronunciation Training .................................... 14
    - 2.3.2 Serious Games and Gamification for Speech Development ......................... 15
    - 2.3.3 Digital Speech Screening and Machine Learning ..................................... 15
  - 2.4 Existing Systems Products and Techniques .................................................... 16
    - 2.4.1 Comparison of Existing Systems ......................................................... 16
    - 2.4.2 Techniques for Scoring and Risk Classification ...................................... 17
    - 2.4.3 Speech Feature Extraction and Alignment ............................................. 17
  - 2.5 Gap Synthesis and Conceptual Framework ..................................................... 18
- **3 RESEARCH METHODOLOGY** ........................................................................ 19
  - 3.1 Research Design ...................................................................................... 19
  - 3.2 Data Participants or Study Materials ............................................................ 20
    - 3.2.1 Speech Prompt Bank and Safari Materials .............................................. 20
    - 3.2.2 Participants and Field Data (Malabe Primary School) ................................. 21
    - 3.2.3 Model Dataset .................................................................................. 22
  - 3.3 Experimental or Study Procedure ................................................................ 22
    - 3.3.1 Development Procedure ..................................................................... 22
    - 3.3.2 Speech Identification Procedure ........................................................... 23
    - 3.3.3 Pronunciation Improvement Procedure ................................................... 23
    - 3.3.4 Model Development Procedure ............................................................. 24
  - 3.4 Measures and Evaluation Metrics ................................................................. 24
  - 3.5 Data Analysis ......................................................................................... 25
  - 3.6 Ethics, Privacy, Security, and Responsible AI ................................................. 26
  - 3.7 Reproducibility and Research Artefacts ........................................................ 27
- **4 PRODUCT AND SOLUTION DESIGN** ............................................................. 28
  - 4.1 Requirements ......................................................................................... 28
  - 4.2 Component Architecture within Complete Solution ........................................... 30
  - 4.3 Design Alternatives and Decisions ................................................................ 32
  - 4.4 Detailed Design ....................................................................................... 34
    - 4.4.1 Content Structure and Safari Activities .................................................. 34
    - 4.4.2 Audio Normalization and Quality Screening Gate ...................................... 35
    - 4.4.3 Identification Scoring and Mathematical Formulation ................................ 36
    - 4.4.4 44-Dimensional Acoustic Feature Extraction ........................................... 37
    - 4.4.5 Placement and Progression Logic .......................................................... 38
    - 4.4.6 Speech Recording and Multimedia Feedback ............................................ 39
    - 4.4.7 Data Design and Interfaces ................................................................. 40
    - 4.4.8 Reporting and Administration .............................................................. 41
  - 4.5 Standards and Professional Practice ............................................................. 42
- **5 IMPLEMENTATION INTEGRATION AND TESTING** ........................................... 43
  - 5.1 Development Environment and Technology Stack ............................................ 43
  - 5.2 Component Implementation ....................................................................... 44
    - 5.2.1 Audio Ingestion and Mic Calibration .................................................... 44
    - 5.2.2 Local Faster-Whisper ASR and Acoustic DSP Pipeline ................................. 45
    - 5.2.3 Five Safari Improvement Activities ...................................................... 46
    - 5.2.4 Placement and Progression Controller ................................................... 47
    - 5.2.5 Reports and Clinician Analytics ........................................................... 48
  - 5.3 Integration with the Other Components ........................................................ 49
  - 5.4 Verification and Software Testing (TC1–TC18) ................................................ 50
  - 5.5 Deployment and Operation ........................................................................ 53
- **6 RESULTS AND VALIDATION** ...................................................................... 55
  - 6.1 Research Results ..................................................................................... 55
    - 6.1.1 Held-Out Test Set Performance ........................................................... 55
    - 6.1.2 Training vs. Test Behaviour and Cross-Validation ..................................... 56
    - 6.1.3 Feature Importance and Acoustic Ranking .............................................. 57
    - 6.1.4 Consistency between Labels and Scoring Rule .......................................... 58
  - 6.2 Product and Technical Results .................................................................... 59
  - 6.3 User and Stakeholder Validation (Malabe Cohort) ............................................. 60
  - 6.4 Integration Results ................................................................................... 61
  - 6.5 Summary of Findings by Research Question ................................................... 62
- **7 DISCUSSION** .......................................................................................... 64
  - 7.1 Interpretation of Findings ......................................................................... 64
  - 7.2 Comparison with Literature Baselines and Existing Solutions ............................. 65
  - 7.3 Research Contribution .............................................................................. 66
  - 7.4 Product Contribution ................................................................................ 67
  - 7.5 Limitations and Threats to Validity ............................................................... 68
    - 7.5.1 Construct Validity ............................................................................ 68
    - 7.5.2 Model and Statistical Conclusion Validity ............................................... 68
    - 7.5.3 Internal Validity of Field Results ......................................................... 69
    - 7.5.4 External Validity ............................................................................. 70
    - 7.5.5 Implementation and Software Boundaries .............................................. 70
  - 7.6 Implications (Teachers, Parents, Engineers, Researchers) ................................. 71
- **8 COMMERCIALISATION AND SUSTAINABILITY** ............................................... 72
  - 8.1 Value Proposition and Target Users ............................................................. 72
  - 8.2 Market and Competitive Position ................................................................ 73
  - 8.3 Business or Sustainability Model ................................................................ 73
  - 8.4 Scalability, Intellectual Property, and Compliance .......................................... 74
  - 8.5 Contribution to the Sustainable Development Goals (SDG 4, 10, 3, 17) ................. 75
- **9 CONCLUSION AND FUTURE DIRECTIONS** ................................................... 77
  - 9.1 Conclusion ............................................................................................. 77
  - 9.2 Achievement of Objectives (Table 9.1) .......................................................... 78
  - 9.3 Individual Research and Product Contributions .............................................. 79
  - 9.4 Prioritized 7-Point Future Research Roadmap ................................................ 79
- **REFERENCES** (IEEE Style, 42 Citations) .......................................................... 81
- **GLOSSARY** (15 Technical Definitions) .............................................................. 85
- **APPENDICES** ............................................................................................. 87
  - **Appendix A: Research Instruments and Safari Specifications** .......................... 87
  - **Appendix B: Academic Integrity and AI Use Disclosure (Table B.1)** .................... 90

---

*(The full formatted 82-page Word (.docx) document and 3.15 MB PDF document are saved and available on your Desktop and in the project folder.)*
