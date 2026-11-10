// v5 (docs/user_study/DESIGN_v5.md): one case per screen, the input and every method's output in a shuffled order.
// The participant ranks all outputs in full three times on the same screen: (1) the part, (2) everything outside the
// part kept as in A, (3) natural. Static site: there is no server. Answers go out one row per screen through
// config.js (Google Form, or the local mock collector); localStorage allows resuming.
// URL params: lang=zh|en, preview=1 (nothing is sent), list=<n> (hand out a list), text_first=1 (with preview)
"use strict";

const CFG = window.STUDY_CONFIG || { mode: "off" };
const APP_VERSION = "v5.6";

// Consent and study information: v3/v4 wording (DESIGN_v3.md), with the storage lines rewritten to say what this
// version does (answers are collected through Google Forms, as the consent form itself says).
const BASE = {
  zh: {
      title: "人臉編輯結果排序",
      kicker: "中央研究院資訊創新研究中心",
      fMin: "分鐘", fSets: "組照片", fQs: "次排序／每組",
      startHint: "研究說明與資料的處理方式在說明框內，可捲動閱讀，讀完再勾選同意。",
      docTitle: "研究說明", docScroll: "在框內捲動閱讀", recordedLabel: "記錄範圍",
      consent1: "我們是中央研究院資訊創新研究中心陳駿丞副研究員的研究團隊。部分照片是由 AI 修改過的。",
      about0: "我們正在進行 AI 生成影像與影片之使用者偏好評量相關研究。本研究旨在評估現有影像與影片生成模型的生成品質，通過主觀和客觀的評估方法，分析模型生成影像的品質，進一步了解並分析生成模型的特性。",
      infoTitle: "研究參與資訊",
      info: [
        ["資料收集", "我們計劃收集 100 - 200 名受試者的生成影像或影片評分資料。"],
        ["遞補機制", "若有人中途退出或數據無法使用，將遞補至收集完所需受試者為止。"],
        ["目標對象", "已滿 18 歲且未受監護宣告之成年。"],
        ["經費來源", "中研院資創中心智慧優網。"],
      ],
      privacyTitle: "資料管理與隱私保障",
      privacy: [
        ["資料用途", "本問卷內容僅供學術研究之用。"],
        ["聯絡資訊", "您的 email 等聯絡資訊僅供 7-11 禮券抽獎使用，不會留下任何身份等敏感資訊。"],
        ["資料刪除", "所有聯絡資料將於問卷調查與抽獎完畢後立即刪除。"],
        ["退出與刪除權利", "您可在填寫問卷時隨時退出，填寫完成後也可來信（nickchiu@citi.sinica.edu.tw 或 pullpull@citi.sinica.edu.tw）要求刪除相關資料，請附上結束頁顯示的參與編號。"],
      ],
      detailTitle: "資料管理細節",
      detail: [
        ["不收集敏感資料", "本計畫實驗不收集任何關於您的個人敏感資料，僅收集生成影像的評分。"],
        ["資料儲存", "作答時答案透過 Google 表單送出，暫存在研究團隊的 Google 帳號；問卷結束後匯出到實驗地點（中央研究院資訊創新研究中心）的資料處理電腦，並刪除 Google 上的副本。除了評分結果與抽獎用 email，研究人員分析資料時不會取得您的身分資料。"],
        ["資料使用限制", "所收集的資料僅供本實驗室人員學術研究使用。"],
        ["抽獎後刪除", "email 聯絡資訊將於抽獎完成後（問卷結束後一至兩週內進行）立即刪除。"],
        ["資料庫管理", "此計畫所收集的資料庫（生成影像評分結果）為不記名資料庫，放置在主持人實驗室伺服器，資料保存和使用時間至計畫結束（2026/12/31）。若被挪作其他用途，本計畫團隊將追溯非法使用來源，以確保您的權益。計畫結束後，實驗室將銷毀相關問卷評量結果。"],
      ],
      recorded: "只記錄你的排序、作答時間、放大次數、語言與螢幕尺寸，不記錄姓名。這個網頁放在 GitHub Pages、答案經 Google 表單送出，GitHub 與 Google 會依各自政策記錄連線紀錄，研究團隊不會取得你的 IP。參加抽獎才會另外記錄你留下的 email，且與答案分開存放。",
      rightsTitle: "參與權益聲明",
      rights: [
        ["研究計畫名稱", "AI 生成影像與影片之使用者偏好評量"],
        ["編號", "ASIRB-HS-24031"],
        ["自願參與", "參加此項計畫是完全自願性質，無論參加與否均不影響您的權益。"],
        ["權益諮詢", "若對參與研究的相關權益有疑問，可來電查詢中央研究院人文社會科學研究倫理委員會 IRB on Humanities & Social Science Research /IRB-HS，查詢電話：02-27898722。"],
      ],
      consentDoc: "中央研究院人文社會科學研究對象說明同意書",
      consentCheck: "我已閱讀研究說明與同意書並同意參加，也確認我已滿 18 歲、未受監護宣告。",
      agree: "同意並開始",
      done: "完成了，謝謝你！",
      sent: "你的答案已經全部送出，可以關閉這個網頁。",
      previewEnd: "這是預覽，答案沒有送出。",
      codeNote: "你的參與編號。之後要刪除資料，請附上編號來信 nickchiu@citi.sinica.edu.tw 或 pullpull@citi.sinica.edu.tw：",
      lotteryTitle: "抽獎（選填）",
      lotteryBody: "有效填寫問卷者可留下 email 參加抽獎，抽出有效問卷的 1/20 贏取 7-11 百元禮券。留空就是不參加，不影響任何權益。",
      lotteryDone: "你已登記抽獎，完成的有效問卷才會列入抽獎。",
      lotteryBad: "這個 email 格式不正確，請再檢查一次，或留空不參加抽獎。",
      pending: (n) => `還有 ${n} 筆沒有送出，可能是網路問題。請按「重新送出」，若一直失敗請按「下載答案」，把檔案寄到 nickchiu@citi.sinica.edu.tw 或 pullpull@citi.sinica.edu.tw。`,
      retry: "重新送出", saveFile: "下載答案",
      errLoad: "目前無法載入題目，請稍後再試。",
      gateTitle: "請使用邀請連結", gateBody: "這個問卷只開放受邀的參與者。請用實驗人員給你的完整連結開啟。",
  },
  en: {
      title: "Rank edited face photos",
      kicker: "Research Center for Information Technology Innovation, Academia Sinica",
      fMin: "minutes", fSets: "sets of photos", fQs: "rankings per set",
      startHint: "The study information and how your data are handled are in the box. Scroll inside it, then tick to agree.",
      docTitle: "Study information", docScroll: "Scroll inside the box", recordedLabel: "What we record",
      consent1: "We are the research team of Associate Research Fellow Jun-Cheng Chen at the Research Center for Information Technology Innovation, Academia Sinica. Some photos were modified by AI.",
      about0: "We are studying user preferences for AI-generated images and videos. The study assesses the output quality of current image and video generation models with subjective and objective evaluations, to understand and analyse the characteristics of these models.",
      infoTitle: "About taking part",
      info: [
        ["Data collected", "We plan to collect ratings of generated images or videos from 100–200 participants."],
        ["Replacement", "If someone withdraws or their data cannot be used, we will recruit until we have enough participants."],
        ["Who can take part", "Adults aged 18 or over who are not under guardianship."],
        ["Funding", "Smart Network program, Research Center for Information Technology Innovation, Academia Sinica."],
      ],
      privacyTitle: "Data and privacy",
      privacy: [
        ["Use", "Your responses are used for academic research only."],
        ["Contact details", "Your email, if you leave one, is used only for the 7-11 voucher draw. No identifying information is kept."],
        ["Deletion", "All contact details are deleted as soon as the survey and the draw are finished."],
        ["Withdrawal and deletion", "You may stop at any time while answering. After finishing, you can ask us to delete your data by emailing nickchiu@citi.sinica.edu.tw or pullpull@citi.sinica.edu.tw with the participant code shown on the last page."],
      ],
      detailTitle: "Data handling",
      detail: [
        ["No sensitive data", "This study collects no sensitive personal data, only your ratings of generated images."],
        ["Storage", "Your answers are sent through Google Forms and held in the research team's Google account while the survey runs. When it closes they are exported to a data-processing computer at the study site (Research Center for Information Technology Innovation, Academia Sinica) and the copy on Google is deleted. Apart from the ratings and the draw email, researchers analysing the data cannot see who you are."],
        ["Restricted use", "The data are used only by members of this lab for academic research."],
        ["Deletion after the draw", "Email addresses are deleted as soon as the draw is done, one to two weeks after the survey closes."],
        ["Database", "The ratings form an anonymous database kept on the principal investigator's lab server until the project ends (2026/12/31). If it is misused, the team will trace the source to protect your rights. When the project ends, the lab will destroy the ratings."],
      ],
      recorded: "We record only your rankings, response times, number of image enlargements, language and screen size, not your name. This page is hosted on GitHub Pages and answers are sent through Google Forms; GitHub and Google keep connection logs under their own policies, and the research team does not receive your IP address. If you enter the prize draw, we also record the email you leave, stored apart from your answers.",
      rightsTitle: "Participant rights",
      rights: [
        ["Project title", "User Preference Study for AI-generated Images and Videos"],
        ["Number", "ASIRB-HS-24031"],
        ["Voluntary participation", "Taking part is completely voluntary. Your rights are not affected whether or not you take part."],
        ["Questions about your rights", "Call the Academia Sinica IRB on Humanities & Social Science Research (IRB-HS) at 02-27898722."],
      ],
      consentDoc: "Academia Sinica Humanities and Social Sciences Research Participant Consent Form (in Chinese)",
      consentCheck: "I have read the study information and the consent form and agree to take part, and I confirm that I am 18 or older and not under guardianship.",
      agree: "Agree and start",
      done: "All done, thank you!",
      sent: "All your answers have been sent. You can close this page.",
      previewEnd: "This is a preview. Your answers were not sent.",
      codeNote: "Your participant code. To have your data deleted later, email this code to nickchiu@citi.sinica.edu.tw or pullpull@citi.sinica.edu.tw:",
      lotteryTitle: "Prize draw (optional)",
      lotteryBody: "If you complete a valid response you may leave an email to enter a draw: 1 in 20 valid responses wins an NT$100 7-11 gift voucher. Leave it empty to skip; this does not affect your rights.",
      lotteryDone: "You entered the draw. Only completed, valid responses take part.",
      lotteryBad: "This email address does not look right. Check it, or leave it empty to skip the draw.",
      pending: (n) => `${n} answer(s) have not been sent, possibly because of the network. Press Resend. If it keeps failing, press Download answers and email the file to nickchiu@citi.sinica.edu.tw or pullpull@citi.sinica.edu.tw.`,
      retry: "Resend", saveFile: "Download answers",
      errLoad: "The questions cannot be loaded right now. Please try again later.",
      gateTitle: "Please use your invitation link", gateBody: "This survey is open to invited participants only. Open it with the full link the experimenter gave you.",
  },
};

const STUDY = {
  zh: {
    lede: "每組有一張原圖，和好幾張用不同 AI 方法修改出來的結果。請依每個問題，各把這些結果從最好排到最差。",
    fMinN: "10–15",
    about1: "本研究透過這個網頁進行問卷調查，提供由模型預先生成的影像，請您對同一張照片的多張修改結果進行評分排序，答案經由 Google 表單收集。",
    howLink: "作答說明",
    introTitle: "每組結果分幾輪排名",
    introLede: "每組左邊是原圖 A，以及參考圖 B 或一句修改指令；右邊是同一張 A 用不同方法改出來的 3–6 張結果。每組結果會出現三次，每次只回答下面其中一個問題：先把所有組排完問題 ①，再回來排 ②，最後排 ③。最後的多部位題一次改兩個部位，會多一輪「照指令改的部位有沒有改對」，共四輪。每次出現時圖的位置都會重新打亂，從第 1 名點到最後一名。",
    rule1: "部位改得對不對", rule1d: "看 A 臉上那個部位：換部位的題目看它像不像 B 的，依指令修改的題目看它有沒有照指令。整張變成 B 或別人、等於沒有改在 A 身上，排最後。接縫、自不自然留給第 ③ 題。",
    rule2: "其他地方有沒有保持原樣", rule2d: "只看要改的部位以外：還是不是 A 這個人，臉型、膚色、背景、光線、姿勢、取景有沒有變。整張變成 B 或別人的排最後。",
    rule3: "整張自不自然", rule3d: "整張看起來像不像一張真的照片：有沒有接縫、色塊、扭曲、模糊或多出來的東西。這題不管有沒有照要求改。",
    note1: "同一張結果在三個問題可以排在不同位置，例如嘴巴換得最像 B，但背景或膚色變了很多，或看起來有接縫。很多張會很像，分不出時照你稍微偏好的順序點就好。",
    note2: "依序點第 1 名、第 2 名……，一直點到最後一名。點錯了：再點一次已經有名次的那張，就會取消它和之後的名次；也可以按「重來」。想改前面的答案，按「上一組」回去。",
    note3: "眼睛和嘴巴的題目，每張結果下面有放大的局部圖。點每張右上角的放大鏡可以看大圖，大圖裡也可以直接選。鍵盤：數字鍵選第幾張、Backspace 取消上一下、Enter 下一組。中途關掉網頁，用同一個瀏覽器再打開可以接續。",
    startPractice: "開始練習（1 題）", practiceSub: "練習不計分，只排一次，熟悉怎麼點名次", backToSets: "回到題目",
    practiceTag: () => "練習題（不計分）",
    chip: { swap: "換部位", text: "依指令修改", multi: "多部位" },
    taskLine: { swap: "把參考圖 B 的{part}換到原圖 A 上", text: "照指令改原圖 A 的{part}", multi: "把參考圖 B 的{swap}換到原圖 A 上，並照指令改{text}" },
    secKicker: (k, n, m) => (k === 0 ? `練習結束。第 1 段，共 ${n} 段（${m} 組）` : `第 ${k + 1} 段，共 ${n} 段（${m} 組）`),
    secTitle: { swap: "換部位", text: "依指令修改", multi: "多部位" },
    secCrit: { part: "：① 部位改得對不對", keep: "：② 其他地方有沒有保持原樣", natural: "：③ 整張自不自然" },
    secCritMulti: { swap: "：① 換的部位像不像 B", text: "：② 改的部位有沒有照指令", keep: "：③ 其他地方有沒有保持原樣", natural: "：④ 整張自不自然" },
    secBody: {
      swap: {
        part: "每組都有參考圖 B 和 5 張結果。這一輪看 A 臉上換過去的部位像不像 B 的；整張變成 B 或別人的排最後。其他地方和自不自然下兩輪再看。",
        keep: "同一批組再出現一次，圖的位置重新打亂。這一輪只看要換的部位以外：還是不是 A 這個人，臉型、膚色、背景、光線、姿勢有沒有變。",
        natural: "同一批組最後出現一次。這一輪只看整張像不像一張真的照片：接縫、色塊、扭曲、模糊排後面，不管有沒有換成功。",
      },
      text: {
        part: "這一段沒有參考圖 B，改成一句修改指令，例如「讓這個人微笑，嘴巴張開」，每組 5 張結果。這一輪看 A 臉上的部位有沒有照指令改；指令有兩三項時每一項都要看。整張變成別人的排最後。",
        keep: "同一批組再出現一次，圖的位置重新打亂。這一輪只看要改的部位以外有沒有保持原樣、還是不是 A 這個人。",
        natural: "同一批組最後出現一次。這一輪只看整張自不自然，不管有沒有照指令改。",
      },
      multi: {
        swap: "最後一段每組同時改兩個部位：一個從參考圖 B 換過來，另一個照指令修改，每組 3 張結果，分四輪排。這一輪看 A 臉上換過來的那個部位像不像 B 的；整張變成 B 或別人的排最後。",
        text: "同一批組再出現一次，圖的位置重新打亂。這一輪看 A 臉上照指令改的那個部位有沒有改對；整張變成別人的排最後。",
        keep: "同一批組再出現一次。這一輪只看兩個被改的部位以外：還是不是 A 這個人，臉型、膚色、背景、光線、姿勢有沒有變。",
        natural: "同一批組最後出現一次。這一輪只看整張自不自然，不管有沒有改成功。",
      },
    },
    secPart: (part, n) => `${part} ${n} 組`,
    multiPart: (sw, tx) => `換${sw}＋改${tx}`,
    cont: "繼續",
    cap: { A: "原圖 A", B: "參考圖 B", C: "參考圖 C" }, instr: "修改指令",
    crit: {
      part: { swap: "哪張把 B 的{part}換到 A 臉上換得最好？", text: "哪張在 A 臉上把{part}改得最符合指令？" },
      keep: "除了{part}以外，哪張最像原圖 A？",
      natural: "哪張整張看起來最自然？",
    },
    critMulti: { swap: "哪張把 B 的{swap}換到 A 臉上換得最好？", text: "哪張在 A 臉上把{text}改得最符合指令？", keep: "除了{swap}和{text}以外，哪張最像原圖 A？", natural: "哪張整張看起來最自然？" },
    critShort: { part: "部位", keep: "其他地方", natural: "自然", swap: "換的部位", text: "改的部位" },
    hint: {
      part_swap: { mouth: "嘴巴要像 B 的；沒換、壞掉、整張變成 B 或別人的排後面", eyes: "眼珠顏色要像 B 的；整張變成 B 或別人的排後面", hair: "髮色、長短、直捲要像 B 的；整張變成 B 或別人的排後面" },
      part_text: { mouth: "笑不笑、嘴巴張開或閉著，兩項都要看", eyes: "只看眼珠顏色；眼皮、眼影或眼白變色不算", hair: "髮色、長短、直捲，每一項都要看" },
      part_multi: "每個被點名的部位都要看",
      keep: "還是 A 這個人，臉型、膚色、背景、光線、姿勢、取景沒變的排前面；整張變成別人的排最後",
      natural: "像真的照片排前面；接縫、色塊、扭曲、模糊排後面。不管有沒有照要求改",
    },
    nextOf: (k, n) => `點第 ${k} 名（共 ${n} 名）`,
    stageDone: "這一題排好了", allDone: "三題都排好了",
    reset: "重來", zoomOne: "放大", pickThis: "選為下一名", unpick: "取消這張的名次",
    next: "下一組", endPractice: "練習結束，開始作答", seeAnswer: "看提示", back: "上一組", backPractice: "上一步",
    fb: {
      natural: (ok) => ok ? "③ 自然：模糊的那張你排在最後兩名，正確。" : "③ 自然：模糊的那張（黃框）應該排在最後。看起來明顯壞掉的結果，請在 ③ 排最後。",
      keep: (ok) => ok ? "② 其他地方：整張變成 B 的那張你排在後段，正確。" : "② 其他地方：整張變成 B 的那張（黃框）已經不是 A 這個人，在 ② 應該排在後段。",
      body: "① 部位沒有標準答案。注意同一張可以在三題排不同位置：整張變成 B 的那張，嘴巴就是 B 的嘴，在 ① 可以排前面，但在 ② 要排後面。",
    },
    refMark: { natural: "③ 應排最後", keep: "② 應排後段" },
    part: { mouth: "嘴巴", eyes: "眼睛", hair: "頭髮" }, partJoin: "、",
  },
  en: {
    lede: "Each set shows one original photo and several results edited by different AI methods. Rank the results from best to worst, once for each question.",
    fMinN: "10–15",
    about1: "This questionnaire runs on this web page. It shows images generated in advance by the models and asks you to rate and rank several edited results of the same photo; answers are collected through Google Forms.",
    howLink: "Instructions",
    introTitle: "Each set is ranked in several rounds",
    introLede: "Each set shows the original photo A on the left, with a reference photo B or an editing instruction. On the right are 3 to 6 results made from A by different methods. Each set comes up three times, and each time you answer only one of the questions below: first question 1 for all sets, then question 2, then question 3. The final several-part sets edit two parts at once and get one extra round, whether the part edited by the instruction was done right, so four rounds. The results are reshuffled every time; click from first place to last.",
    rule1: "Is the part edited correctly?", rule1d: "Look at that part on A's face: for a part swap, does it look like B's; for a text edit, does it follow the instruction. A result that turned into B or someone else was not edited on A and goes last. Seams and naturalness belong to question (3).",
    rule2: "Is everything else kept as it was?", rule2d: "Look only outside the edited part: is it still the person in A, with the same face shape, skin tone, background, lighting, pose and framing? A result that turned into B or someone else goes last.",
    rule3: "Does the whole photo look natural?", rule3d: "Does it look like a real photo: no seams, colour patches, distortion, blur or added things. This question ignores whether the edit was done.",
    note1: "One result can rank differently on the three questions, for example the mouth looks most like B's, but the background or skin tone changed a lot, or there is a visible seam. Many results will look similar; if you cannot tell them apart, click in the order you slightly prefer.",
    note2: "Click first place, then second, and so on, down to last place. Clicked the wrong one? Click a ranked result again to remove it and the ranks after it, or press Start over. To change an earlier answer, press Previous.",
    note3: "For eyes and mouths, a close-up sits below each result. The magnifier at the top right of a result opens a large view, where you can also choose it. Keyboard: number keys choose a result, Backspace undoes the last click, Enter goes to the next set. If you close the page, reopen it in the same browser to continue.",
    startPractice: "Start practice (1 question)", practiceSub: "Practice is not scored; rank once to learn the clicking", backToSets: "Back to the sets",
    practiceTag: () => "Practice (not scored)",
    chip: { swap: "Part swap", text: "Text edit", multi: "Several parts" },
    taskLine: { swap: "Put B's {part} onto original photo A", text: "Edit the {part} in original photo A as instructed", multi: "Put B's {swap} onto original photo A and edit the {text} as instructed" },
    secKicker: (k, n, m) => (k === 0 ? `Practice finished. Round 1 of ${n} (${m} sets)` : `Round ${k + 1} of ${n} (${m} sets)`),
    secTitle: { swap: "Part swap", text: "Text edit", multi: "Several parts" },
    secCrit: { part: ": (1) is the part right", keep: ": (2) is the rest unchanged", natural: ": (3) does it look natural" },
    secCritMulti: { swap: ": (1) does the swapped part look like B's", text: ": (2) does the edited part follow the instruction", keep: ": (3) is the rest unchanged", natural: ": (4) does it look natural" },
    secBody: {
      swap: {
        part: "Every set has a reference photo B and 5 results. In this round look at the part swapped onto A's face: does it look like B's. A result that turned into B or someone else goes last. The rest and naturalness come in the next two rounds.",
        keep: "The same sets come back, reshuffled. In this round look only outside the swapped part: is it still the person in A, with the same face shape, skin, background, lighting and pose.",
        natural: "The same sets come back one last time. In this round look only at whether the whole photo looks real: seams, colour patches, distortion and blur rank low, whether or not the swap worked.",
      },
      text: {
        part: "This part has no reference photo B. Instead there is an editing instruction, such as \"make this person smile with their mouth open\", and 5 results. In this round look at whether the part on A's face follows the instruction; check every item when there are two or three. A result that turned into someone else goes last.",
        keep: "The same sets come back, reshuffled. In this round look only outside the edited part: is it unchanged and still the person in A.",
        natural: "The same sets come back one last time. In this round look only at whether the whole photo looks natural, whether or not the edit was done.",
      },
      multi: {
        swap: "In this last part each set edits two parts at once: one is taken from reference photo B, the other follows an instruction. Each set has 3 results and is ranked in four rounds. In this round look at the part swapped onto A's face: does it look like B's. A result that turned into B or someone else goes last.",
        text: "The same sets come back, reshuffled. In this round look at the part edited by the instruction on A's face: was it done right. A result that turned into someone else goes last.",
        keep: "The same sets come back. In this round look only outside the two edited parts: is it still the person in A, with the same face shape, skin, background, lighting and pose.",
        natural: "The same sets come back one last time. In this round look only at whether the whole photo looks natural, whether or not the edits worked.",
      },
    },
    secPart: (part, n) => `${part}: ${n} sets`,
    multiPart: (sw, tx) => `${sw} swapped + ${tx} edited`,
    cont: "Continue",
    cap: { A: "Original A", B: "Reference B", C: "Reference C" }, instr: "Instruction",
    crit: {
      part: { swap: "Which puts B's {part} onto A's face best?", text: "Which edits the {part} on A's face to best follow the instruction?" },
      keep: "Apart from the {part}, which looks most like original A?",
      natural: "Which looks most natural overall?",
    },
    critMulti: { swap: "Which puts B's {swap} onto A's face best?", text: "Which edits the {text} on A's face to best follow the instruction?", keep: "Apart from the {swap} and the {text}, which looks most like original A?", natural: "Which looks most natural overall?" },
    critShort: { part: "Part", keep: "Rest kept", natural: "Natural", swap: "Swapped part", text: "Edited part" },
    hint: {
      part_swap: { mouth: "The mouth should look like B's; unchanged, broken, or turned into B or someone else goes low", eyes: "Iris colour should match B's; turned into B or someone else goes low", hair: "Colour, length, straight or curly should match B's; turned into B or someone else goes low" },
      part_text: { mouth: "Smiling or not, mouth open or closed: check both", eyes: "Look only at iris colour; colour on eyelids or the whites does not count", hair: "Colour, length, straight or wavy: check every part" },
      part_multi: "Check every part that is named",
      keep: "Still the person in A, with the same face shape, skin, background, lighting, pose and framing ranks high; turned into someone else ranks last",
      natural: "Looks like a real photo ranks high; seams, colour patches, distortion or blur rank low. Ignore whether the edit was done",
    },
    nextOf: (k, n) => `Click number ${k} (of ${n})`,
    stageDone: "This question is ranked", allDone: "All three questions are ranked",
    reset: "Start over", zoomOne: "Enlarge", pickThis: "Choose as next", unpick: "Remove its rank",
    next: "Next", endPractice: "Done, start the survey", seeAnswer: "See hints", back: "Previous", backPractice: "Back",
    fb: {
      natural: (ok) => ok ? "(3) Natural: you put the blurred one in the last two places. Correct." : "(3) Natural: the blurred one (outlined in yellow) should be last. Put results that are clearly broken last in question 3.",
      keep: (ok) => ok ? "(2) Rest kept: you put the one that turned into B low. Correct." : "(2) Rest kept: the one that turned into B (outlined in yellow) is no longer the person in A and should rank low in question 2.",
      body: "Question 1 has no reference answer. Note that one result can rank differently on the three questions: the one that turned into B has B's mouth, so it can rank high in question 1, but it should rank low in question 2.",
    },
    refMark: { natural: "(3) should be last", keep: "(2) should rank low" },
    part: { mouth: "mouth", eyes: "eyes", hair: "hair" }, partJoin: ", ",
  },
};
const I18N = { zh: Object.assign({}, BASE.zh, STUDY.zh), en: Object.assign({}, BASE.en, STUDY.en) };

const CRITERIA = ["part", "keep", "natural"];
// multi-part sets (one part swapped from B, another edited by text) are ranked on four criteria
const MULTI_CRITERIA = ["swap", "text", "keep", "natural"];
const ALL_CRITERIA = ["part", "keep", "natural", "swap", "text"];
function critsOf(it) { return it.task === "multi" ? MULTI_CRITERIA : CRITERIA; }
function critNum(it, c) { const i = critsOf(it).indexOf(c); return lang === "zh" ? "①②③④"[i] : `(${i + 1})`; }
const EMAIL_RE = /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const PREVIEW = params.has("preview") || CFG.mode === "off";
let bank = null, S = null, cur = null, view = "v-start";
let lang = [params.get("lang"), lsGet("us5_lang")].find((l) => l === "zh" || l === "en") || (navigator.language.startsWith("zh") ? "zh" : "en");

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window: resume is unavailable */ } }
function T(k) { return I18N[lang][k]; }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function partName(it) {
  if (it.task === "multi") return T("multiPart")(T("part")[it.swap_part], T("part")[it.text_part]);
  return it.parts.map((p) => T("part")[p]).join(T("partJoin"));
}

function applyLang() {
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll("[data-i18n]").forEach((x) => { x.textContent = T(x.dataset.i18n); });
  document.querySelectorAll(".lang button").forEach((b) => {
    b.classList.toggle("on", b.dataset.lang === lang);
    b.setAttribute("aria-pressed", b.dataset.lang === lang);
  });
  renderConsent();
  renderPracticeTag();
  if (bank) renderFacts();
  if (view === "v-intro") renderIntro();
  if (view === "v-section") renderSection();
  if (cur) { renderRefs(); renderTrial(); }
  if (view === "v-end") renderEnd();
}
function renderConsent() {
  $("consent-link").href = CFG.consentUrl || "#";
  $("about").replaceChildren(...[T("consent1"), T("about0"), T("about1")].map((text) => el("p", null, text)));
  const lists = { info: T("info"), privacy: [[T("recordedLabel"), T("recorded")], ...T("privacy")], detail: T("detail"), rights: T("rights") };
  for (const [id, rows] of Object.entries(lists)) {
    $(id).replaceChildren(...rows.map(([label, text]) => { const row = el("div"); row.append(el("dt", null, label), el("dd", null, text)); return row; }));
  }
}
function groupOf(L) { return bank.groups[L]; }
function screensOf(L) { const g = groupOf(L); return g.items.concat(g.multi || []); }
function renderFacts() { $("f-sets").textContent = screensOf(S ? S.list : 0).length; }
function setLang(l) {
  lang = l; lsSet("us5_lang", l); applyLang();
  if (S) { S.lang = l; save(); }
}
function show(v) {
  view = v;
  ["v-gate", "v-start", "v-intro", "v-trial", "v-section", "v-end"].forEach((x) => { $(x).hidden = x !== v; });
  $("btn-how").hidden = !(S && S.phase !== "intro" && (v === "v-trial" || v === "v-section"));
  if (v !== "v-trial") { $("prog").hidden = true; $("prog-text").textContent = ""; }
  renderPracticeTag();
  window.scrollTo(0, 0);
}

function storeKey() { return `us:${bank.study_id}:state`; }
function save() { if (!PREVIEW) lsSet(storeKey(), JSON.stringify(S)); }

// Reproducible per participant: a seeded generator from a string. analysis/export_results.py has the same code in
// Python and recomputes every layout; rows whose layout does not match are dropped.
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffled(xs, rnd) { const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Steps are "tid|criterion". Blocks: the swap sets, then the text sets, then the multi-part sets. Each block is
// answered in three passes, one criterion per pass (all sets for question 1, then all for 2, then 3), so a set never
// comes back right away. Within a pass the parts come in random order, a part's sets together; the next pass is
// reshuffled, and if it would start with the set that ended the last pass, its first two swap. Each pass also gets a
// new layout (layoutFor). Seeded by the participant code (study_rng.py has the same code).
function passOrder(items, rnd) {
  const ids = [];
  shuffled(["mouth", "eyes", "hair"], rnd).forEach((part) => {
    shuffled(items.filter((it) => it.parts.length === 1 && it.parts[0] === part), rnd).forEach((it) => ids.push(it.tid));
  });
  shuffled(items.filter((it) => it.parts.length !== 1), rnd).forEach((it) => ids.push(it.tid));   // multi-part sets
  return ids;
}
function ordered(L, pid) {
  const rnd = rng(pid);
  const g = groupOf(L), order = [], cuts = [];
  const blocks = [g.items.filter((it) => it.task === "swap"), g.items.filter((it) => it.task === "text"), g.multi || []];
  let prevLast = null;
  blocks.filter((b) => b.length).forEach((items) => {
    critsOf(items[0]).forEach((c) => {
      let ids = passOrder(items, rnd);
      if (ids.length > 1 && ids[0] === prevLast) ids = [ids[1], ids[0], ...ids.slice(2)];
      ids.forEach((tid) => order.push(`${tid}|${c}`));
      prevLast = ids[ids.length - 1];
      cuts.push(order.length);
    });
  });
  return { order, cuts, swapFirst: true };
}
function stepOf(key) { const i = key.lastIndexOf("|"); return { tid: key.slice(0, i), crit: key.slice(i + 1) }; }
// Swap sets show FaceLex + 4 of 6 baselines (2026-11-10): which 5 comes from the counter (S.show), else the bank's
// fallback "def"; other sets show all their candidates. The same 5 in every round of a set.
function shownIds(it) { return (S && S.show && S.show[it.tid]) || it.def || it.cands.map((c) => c.id); }
function layoutFor(it, crit) { return shuffled(shownIds(it), rng(`${S.pid}|${it.tid}|${crit}`)); }
function itemById(tid) { return screensOf(S.list).find((it) => it.tid === tid); }
function sectionStep(k) { return stepOf(S.order[k === 0 ? 0 : S.cuts[k - 1]]); }
function sectionTask(k) {
  const first = itemById(sectionStep(k).tid);
  return first ? first.task : "swap";
}

function newPid() {
  const a = new Uint8Array(10), abc = "abcdefghijkmnpqrstuvwxyz23456789";
  crypto.getRandomValues(a);
  return Array.from(a, (x) => abc[x % abc.length]).join("");
}
function randomList(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
// The assignment counter (Apps Script, counter/Code.gs.template): the next slot of a private permuted-block sequence,
// i.e. a list and, for each of its swap sets, the bank positions of the 5 results to show. null on any failure or
// after 6 s; the page then falls back to a random list and the bank's "def" subsets.
async function getSlot(n) {
  if (!CFG.counterUrl) return null;
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(CFG.counterUrl, { signal: ctl.signal, cache: "no-store" });
    const d = await res.json();
    clearTimeout(timer);
    if (d.study !== bank.study_id || !Number.isInteger(d.slot) || !Number.isInteger(d.list) || d.list < 0 || d.list >= n) return null;
    const swaps = bank.groups[d.list].items.filter((it) => it.task === "swap");
    if (!Array.isArray(d.show) || d.show.length !== swaps.length) return null;
    const show = {};
    for (let i = 0; i < swaps.length; i++) {
      const code = String(d.show[i]);
      if (!/^[0-9]{2,9}$/.test(code)) return null;
      const ids = [...code].map((ch) => swaps[i].cands[+ch] && swaps[i].cands[+ch].id);
      if (ids.some((x) => !x) || new Set(ids).size !== ids.length) return null;
      show[swaps[i].tid] = ids;
    }
    return { slot: d.slot, list: d.list, show };
  } catch (e) { return null; }
}

async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), (x) => x.toString(16).padStart(2, "0")).join("");
}
async function gateOk() {
  if (!CFG.accessHash) return true;
  const k = new URLSearchParams(location.hash.slice(1)).get("k") || lsGet("us5_k") || "";
  if (k && await sha256hex(k) === CFG.accessHash) { lsSet("us5_k", k); return true; }
  return false;
}

async function init() {
  document.querySelectorAll(".lang button").forEach((b) => { b.onclick = () => setLang(b.dataset.lang); });
  applyLang();
  if (!(await gateOk())) { show("v-gate"); return; }
  $("btn-start").onclick = begin;
  $("consent-check").onchange = syncConsent;
  syncConsent();
  $("btn-intro").onclick = leaveIntro;
  $("btn-section").onclick = leaveSection;
  $("btn-next").onclick = next;
  $("btn-back").onclick = back;
  $("btn-reset").onclick = resetStage;
  $("btn-how").onclick = openIntro;
  $("btn-retry").onclick = () => flush().then(renderEnd);
  $("btn-save").onclick = saveFile;
  [0, 1, 2].forEach((k) => { $(`step-${k}`).onclick = () => goStage(k); });
  $("lb-close").onclick = closeZoom;
  $("lb-prev").onclick = () => stepZoom(-1);
  $("lb-next").onclick = () => stepZoom(1);
  $("lb-pick").onclick = () => { if (zoomIdx != null) { act(cur.layout[zoomIdx]); renderZoom(); } };
  $("lightbox").onclick = (e) => { if (e.target === $("lightbox")) closeZoom(); };
  document.addEventListener("keydown", onKey);
  try {
    bank = await (await fetch("bank.json", { cache: "no-cache" })).json();
  } catch (e) {
    $("start-err").textContent = T("errLoad");
    show("v-start");
    return;
  }
  renderFacts();
  syncConsent();
  if (PREVIEW) { show("v-start"); return; }
  try { S = JSON.parse(lsGet(storeKey()) || "null"); } catch (e) { S = null; }
  if (!S || !S.order || S.app !== APP_VERSION) { S = null; show("v-start"); return; }
  applyLang();
  resume();
}

function resume() {
  if (S.phase === "intro") showIntro();
  else if (S.phase === "practice") startPractice();
  else if (S.section) showSection();
  else if (S.idx >= S.order.length) finish();
  else { show("v-trial"); renderMain(); }
}

function syncConsent() { $("btn-start").disabled = !$("consent-check").checked || !bank; }

let starting = false;
async function begin() {
  if (!$("consent-check").checked || !bank) return;
  $("start-err").textContent = "";
  const email = $("lottery-email").value.trim();
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) { $("start-err").textContent = T("lotteryBad"); return; }
  const n = bank.groups.length, asked = params.get("list");
  const forced = asked !== null && /^\d+$/.test(asked) && +asked < n;
  if (starting) return;
  starting = true; $("btn-start").disabled = true;
  const got = PREVIEW || forced ? null : await getSlot(n);
  starting = false; syncConsent();
  const list = forced ? +asked : got ? got.list : randomList(n);
  const pid = PREVIEW ? "preview" : newPid();
  S = { app: APP_VERSION, pid, list, assigned: forced, slot: got ? got.slot : null, show: got ? got.show : null,
        lang, phase: "intro", idx: 0, section: 0,
        answers: {}, unsent: [], finished: false, finishSent: false, lottery: !!email, t0: Date.now() };
  Object.assign(S, ordered(list, pid));
  if (!PREVIEW) {
    queue({ kind: "start", list, first: S.swapFirst ? "swap" : "text", lang, screen: `${screen.width}x${screen.height}`,
            assigned: S.assigned ? 1 : 0, slot: S.slot === null ? "none" : S.slot });
    // the address goes to its own form, apart from the answers, and is never kept in the browser
    if (email) sendLottery(pid, email);
  }
  save();
  renderFacts();
  showIntro();
}

// ---------- instructions and section pages ----------
let introFrom = null;
function showIntro() { introFrom = null; show("v-intro"); renderIntro(); }
function openIntro() { introFrom = { view }; closeZoom(); show("v-intro"); renderIntro(); }
function renderIntro() {
  $("btn-intro").textContent = introFrom ? T("backToSets") : T("startPractice");
  $("intro-sub").textContent = introFrom ? "" : T("practiceSub");
}
function leaveIntro() {
  if (introFrom) {
    const from = introFrom; introFrom = null;
    show(from.view);
    if (from.view === "v-trial") { if (S.phase === "main") renderProgress(); renderRefs(); renderTrial(); }
    else if (from.view === "v-section") renderSection();
    return;
  }
  startPractice();
}
function startPractice() { S.phase = "practice"; save(); show("v-trial"); renderPractice(); }

function showSection() { show("v-section"); renderSection(); }
function renderSection() {
  const k = S.section - 1, lo = k === 0 ? 0 : S.cuts[k - 1], ids = S.order.slice(lo, S.cuts[k]).map((x) => stepOf(x).tid);
  const task = sectionTask(k), crit = sectionStep(k).crit, parts = [];
  ids.map(itemById).forEach((it) => {
    const p = partName(it), last = parts[parts.length - 1];
    if (last && last.part === p) last.n += 1; else parts.push({ part: p, n: 1 });
  });
  $("sec-kicker").textContent = T("secKicker")(k, S.cuts.length, ids.length);
  $("sec-chip").textContent = T("chip")[task];
  $("sec-title").textContent = T("secTitle")[task] + T(task === "multi" ? "secCritMulti" : "secCrit")[crit];
  $("sec-body").textContent = T("secBody")[task][crit];
  $("sec-parts").replaceChildren(...parts.map((p) => el("span", null, T("secPart")(p.part, p.n))));
}
function leaveSection() {
  S.section = 0; save();
  if (S.idx >= S.order.length) { finish(); return; }
  show("v-trial"); renderMain();
}

// ---------- one screen ----------
// cur.ranks[c]: candidate ids in rank order for criterion c (complete when it has every candidate).
// cur.crit: the criterion of this step; a step ranks one criterion only.
function setItem(it, practice, prev, crit) {
  crit = crit || critsOf(it)[0];
  const layout = practice ? it.cands.map((c) => c.id) : layoutFor(it, crit);
  const ranks = { [crit]: prev ? prev.rank.slice() : [] };
  cur = { it, practice, layout, n: layout.length, byId: Object.fromEntries(it.cands.map((c) => [c.id, c])),
          ranks, crit, ms: {}, prevRt: prev ? prev.rt_ms : 0,
          revisit: !!prev, zooms: prev ? prev.zooms : 0, showFb: false, t0: performance.now() };
  renderRefs();
  $("v-trial").classList.toggle("practice", practice);
  const hasClose = it.cands.some((c) => c.closes && c.closes.length);
  const grid = $("grid");
  grid.className = `grid n${cur.n}${hasClose ? " close" : ""}`;
  grid.replaceChildren(...layout.map((cid, i) => {
    const c = cur.byId[cid];
    const tile = el("div", "tile");
    tile.dataset.cid = cid;
    const pick = el("button", "tile-pick");
    pick.type = "button";
    const img = el("img"); img.src = c.img; img.alt = ""; img.draggable = false;
    pick.append(img);
    (c.closes || []).forEach((src) => { const ci = el("img", "close"); ci.src = src; ci.alt = ""; ci.draggable = false; pick.append(ci); });
    pick.append(el("span", "num", String(i + 1)), el("span", "badge"), el("span", "refmark"));
    pick.onclick = () => act(cid);
    const z = el("button", "tile-zoom");
    z.type = "button";
    z.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M16.5 16.5L21 21M11 8v6M8 11h6"></path></svg>';
    z.onclick = (e) => { e.stopPropagation(); openZoom(i); };
    tile.append(pick, z);
    return tile;
  }));
  renderPracticeTag();
  Promise.all(Array.from(grid.querySelectorAll("img")).map((x) => x.decode().catch(() => null)))
    .then(() => { if (cur && cur.it === it && !cur.revisit && !cur.ranks.part.length) cur.t0 = performance.now(); });
  renderTrial();
  window.scrollTo(0, 0);
}

function renderRefs() {
  const it = cur.it, box = $("refs");
  const figs = it.refs.map((r) => {
    const f = el("figure");
    const img = el("img"); img.src = r.img; img.alt = ""; img.onclick = () => zoomRef(r.img);
    f.append(img);
    // which close-ups a reference gets is decided when the bank is built (multi-part: B only for the part taken from B)
    (r.closes || []).forEach((src) => { const c = el("img", "close"); c.src = src; c.alt = ""; c.onclick = () => zoomRef(src); f.append(c); });
    f.append(el("figcaption", null, T("cap")[r.role]));
    return f;
  });
  if (it.instr_en) {
    const ib = el("div", "instr-box");
    ib.append(el("div", "instr-label", T("instr")), el("div", "instr-text", it.instr_en));
    if (it.instr_note_en) ib.append(el("div", "instr-note", it.instr_note_en));
    if (lang === "zh" && it.instr_zh) ib.append(el("div", "instr-sub", it.instr_zh));
    figs.push(ib);
  }
  box.replaceChildren(...figs);
}

function elapsed() { return cur.prevRt + Math.round(performance.now() - cur.t0); }
function allDone() { return cur.ranks[cur.crit].length === cur.n; }

// One click on a candidate in the current criterion.
function act(cid) {
  if (!cur || cur.showFb) return;
  const c = cur.crit, r = cur.ranks[c];
  const at = r.indexOf(cid);
  if (at >= 0) cur.ranks[c] = r.slice(0, at);           // clicking a ranked one undoes it and everything after
  else if (r.length < cur.n) {
    r.push(cid);
    if (r.length === cur.n) cur.ms[c] = elapsed();
  }
  renderTrial();
}
function undo() {
  if (!cur || cur.showFb) return;
  const c = cur.crit;
  cur.ranks[c] = cur.ranks[c].slice(0, -1);
  renderTrial();
}
function resetStage() { if (cur && !cur.showFb) { cur.ranks[cur.crit] = []; renderTrial(); } }
function goStage(k) { /* one criterion per step: the step buttons only show which question this is */ }
function flashStage() {
  const bar = document.querySelector(".stepbar");
  bar.classList.remove("flash"); void bar.offsetWidth; bar.classList.add("flash");
}

function renderPracticeTag() {
  const on = !!(view === "v-trial" && cur && cur.practice);
  $("practice-tag").hidden = !on;
  if (on) $("practice-tag").textContent = T("practiceTag")();
}

function stepText() {
  const it = cur.it, c = cur.crit;
  let q, hint;
  if (it.task === "multi") {
    q = T("critMulti")[c].replaceAll("{swap}", T("part")[it.swap_part]).replaceAll("{text}", T("part")[it.text_part]);
    hint = c === "swap" ? T("hint").part_swap[it.swap_part] : c === "text" ? T("hint").part_text[it.text_part] : T("hint")[c];
  } else {
    q = (c === "part" ? T("crit").part[it.task] : T("crit")[c]).replaceAll("{part}", partName(it));
    hint = c === "part" ? T("hint")[`part_${it.task}`][it.parts[0]] : T("hint")[c];
  }
  return [`${critNum(it, c)} ${q}`, hint];
}
function taskLine(it) {
  if (it.task !== "multi") return T("taskLine")[it.task].replaceAll("{part}", partName(it));
  return T("taskLine").multi.replaceAll("{swap}", T("part")[it.swap_part]).replaceAll("{text}", T("part")[it.text_part]);
}

function renderTrial() {
  const it = cur.it, part = partName(it), c = cur.crit, r = cur.ranks[c];
  $("task-chip").textContent = T("chip")[it.task];
  $("part-name").textContent = part;
  $("task-line").textContent = taskLine(it);
  const [q, hint] = stepText();
  $("step-q").textContent = q;
  $("step-hint").textContent = hint;
  // one criterion per step: a single step badge shows which question this is
  [1, 2].forEach((k) => { $(`step-${k}`).hidden = true; });
  const b = $("step-0");
  b.hidden = false;
  b.textContent = String(critsOf(it).indexOf(c) + 1);
  b.classList.add("on");
  b.classList.toggle("done", allDone());
  b.setAttribute("aria-selected", true);
  b.title = T("critShort")[c];
  b.disabled = cur.showFb;
  $("slots").replaceChildren(el("span", "slot-text" + (r.length === cur.n ? " done" : ""),
    r.length === cur.n ? T("stageDone") : T("nextOf")(r.length + 1, cur.n)));
  const ref = cur.showFb ? cur.it.ref : null;
  document.querySelectorAll("#grid .tile").forEach((tile) => {
    const cid = tile.dataset.cid, at = r.indexOf(cid), badge = tile.querySelector(".badge");
    badge.textContent = at >= 0 ? String(at + 1) : "";
    tile.classList.toggle("ranked", at >= 0);
    tile.classList.toggle("lastplace", at === cur.n - 1);
    const mark = ref && (ref.natural_last === cid || ref.keep_low === cid);
    tile.classList.toggle("ref", !!mark);
    tile.querySelector(".refmark").textContent = !mark ? "" : ref.natural_last === cid ? T("refMark").natural : T("refMark").keep;
    const btn = tile.querySelector(".tile-pick");
    btn.disabled = cur.showFb;
    btn.setAttribute("aria-label", `${tile.querySelector(".num").textContent}${at >= 0 ? ` · ${at + 1}` : ""}`);
    btn.setAttribute("aria-pressed", at >= 0);
  });
  $("btn-reset").textContent = T("reset");
  $("btn-reset").hidden = !r.length || cur.showFb;
  $("stage-note").textContent = "";
  $("btn-next").disabled = !allDone();
  $("btn-next").textContent = cur.practice ? T("endPractice") : T("next");
  $("btn-back").hidden = !cur.practice && S.idx === 0;
  $("back-label").textContent = cur.practice ? T("backPractice") : T("back");
  $("btn-back").setAttribute("aria-label", $("back-label").textContent);
  if (cur.showFb) {
    const ref2 = cur.it.ref, n = cur.n;
    const natOk = cur.ranks.natural.indexOf(ref2.natural_last) >= n - 2;
    const keepOk = cur.ranks.keep.indexOf(ref2.keep_low) >= n - 3;
    $("fb-text").replaceChildren(el("p", null, T("fb").natural(natOk)), el("p", null, T("fb").keep(keepOk)),
      el("p", "muted", T("fb").body));
    $("fb-text").hidden = false;
  } else $("fb-text").hidden = true;
  if (zoomIdx != null) renderZoom();
}

// The bar's cells jump to any step (user 2026-11-10). Landing on an unanswered step of a round nobody has started
// shows that round's intro page first (not in preview). The study only finishes once every step is answered.
function sectionOfStep(i) { return S.cuts.findIndex((c) => i < c); }
function firstUnanswered() { return S.order.findIndex((x) => !S.answers[x]); }
function goStep(k) {
  S.idx = k; S.section = 0;
  const sec = sectionOfStep(k), lo = sec === 0 ? 0 : S.cuts[sec - 1];
  if (!PREVIEW && !S.answers[S.order[k]] && !S.order.slice(lo, S.cuts[sec]).some((x) => S.answers[x])) S.section = sec + 1;
  save();
  if (S.section) { cur = null; showSection(); } else { show("v-trial"); renderMain(); }
}
function jumpTo(k) {
  if (k === S.idx || k < 0 || k >= S.order.length) return;
  closeZoom();
  goStep(k);
}
function renderProgress() {
  const i = S.idx + 1, n = S.order.length, reach = n - 1;
  $("prog-text").textContent = `${i} / ${n}`;
  const bar = $("prog");
  bar.hidden = false;
  while (bar.children.length < n) {
    const t = document.createElement("i"), k = bar.children.length;
    t.onclick = () => jumpTo(k);
    bar.append(t);
  }
  Array.from(bar.children).forEach((t, k) => {
    t.classList.toggle("done", !!S.answers[S.order[k]] && k !== i - 1);
    t.classList.toggle("now", k === i - 1);
    t.classList.toggle("can", k <= reach && k !== i - 1);
    t.title = `${k + 1} / ${n}`;
  });
}
function renderPractice() {
  $("prog").hidden = true; $("prog-text").textContent = "";
  cur = null;
  setItem(bank.practice[0], true);
}
function renderMain() {
  renderProgress();
  const key = S.order[S.idx], st = stepOf(key);
  setItem(itemById(st.tid), false, S.answers[key], st.crit);
  const nx = S.order[S.idx + 1] && itemById(stepOf(S.order[S.idx + 1]).tid);
  if (nx) [...nx.refs.flatMap((r) => [r.img, ...(r.closes || [])]), ...nx.cands.filter((c) => shownIds(nx).includes(c.id)).flatMap((c) => [c.img, ...(c.closes || [])])]
    .forEach((src) => { new Image().src = src; });
}

function next() {
  if ($("btn-next").disabled) return;
  if (cur.practice) {
    cur = null; S.phase = "main"; S.section = 1; save(); showSection();
    return;
  }
  const crit = cur.crit, key = S.order[S.idx];
  const rec = { tid: cur.it.tid, crit, seq: S.idx, layout: cur.layout, rank: cur.ranks[crit].slice(),
                rt_ms: elapsed(), zooms: cur.zooms };
  const old = S.answers[key];
  const changed = !old || JSON.stringify(old.rank) !== JSON.stringify(rec.rank);
  rec.revisit = old ? (old.revisit || 0) + 1 : 0;
  S.answers[key] = rec;
  if (changed) queue({ kind: "answer", ...rec });
  S.idx += 1;
  closeZoom();
  // past the last step with steps still unanswered (the bar allows skipping): go to the first one instead of finishing
  if (S.idx >= S.order.length && !PREVIEW && firstUnanswered() >= 0) { goStep(firstUnanswered()); return; }
  const k = S.cuts.indexOf(S.idx);
  if (k >= 0 && S.idx < S.order.length && !S.answers[S.order[S.idx]]) S.section = k + 2;
  save();
  if (S.section) { cur = null; showSection(); }
  else if (S.idx >= S.order.length) finish();
  else renderMain();
}

function back() {
  closeZoom();
  if (cur.practice) {
    cur = null; S.phase = "intro"; save(); showIntro();
    return;
  }
  if (S.idx === 0) return;
  S.idx -= 1; save();
  renderMain();
}

// ---------- sending ----------
// One row per event. Fields map to Google Form entries in config.js; the mock collector takes the same row as JSON.
function row(r) {
  const j = (x) => (Array.isArray(x) ? x.join(";") : x);
  const rk = (c) => (r.crit === c ? j(r.rank) : "");
  return { study: bank.study_id, app: APP_VERSION, pid: S.pid, list: S.list, kind: r.kind, tid: r.tid || "",
           crit: r.crit || "", seq: r.seq != null ? r.seq : "", layout: j(r.layout || ""),
           part: rk("part"), keep: rk("keep"), natural: rk("natural"), swap: rk("swap"), text: rk("text"),
           ms: r.rt_ms != null ? String(r.rt_ms) : "",
           zooms: r.zooms != null ? r.zooms : "", revisit: r.revisit != null ? r.revisit : "",
           meta: r.kind === "start" ? `first=${r.first};lang=${r.lang};screen=${r.screen};assigned=${r.assigned};slot=${r.slot}` : (r.kind === "finish" ? `total_ms=${r.total_ms}` : ""),
           cts: new Date().toISOString() };
}
function queue(r) {
  if (PREVIEW) return;
  S.unsent.push(row(r));
  save();
  flush();
}
async function post(target, data) {
  if (CFG.mode === "mock") {
    const res = await fetch(target.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error(String(res.status));
    return;
  }
  // Google Forms: a simple form POST; the response is opaque (no-cors), so only network errors are seen.
  // The form has one paragraph question; the whole row goes into it as JSON (target.entry = "entry.NNN").
  const body = new URLSearchParams();
  body.append(target.entry, JSON.stringify(data));
  await fetch(target.url, { method: "POST", mode: "no-cors", body });
}
let flushing = null;
function flush() {
  if (PREVIEW) return Promise.resolve();
  if (!flushing) flushing = sendPending().finally(() => { flushing = null; });
  return flushing;
}
async function sendPending() {
  while (S.unsent.length) {
    let ok = false;
    for (let tries = 0; tries < 3 && !ok; tries++) {
      try { await post(CFG.answers, S.unsent[0]); ok = true; } catch (e) { await new Promise((r) => setTimeout(r, 800 * (tries + 1))); }
    }
    if (!ok) return;
    S.unsent.shift();
    save();
  }
}
function sendLottery(pid, email) {
  const data = { study: bank.study_id, pid, email };
  post(CFG.lottery, data).catch(() => post(CFG.lottery, data).catch(() => null));
}

async function finish() {
  if (!PREVIEW && firstUnanswered() >= 0) { goStep(firstUnanswered()); return; }
  $("prog-text").textContent = ""; $("prog").hidden = true; cur = null;
  if (!S.finished) { S.finished = true; queue({ kind: "finish", total_ms: Date.now() - S.t0 }); }
  save();
  show("v-end");
  await flush();
  renderEnd();
}
function renderEnd() {
  const n = S.unsent.length, ok = !n || PREVIEW;
  $("end-status").textContent = PREVIEW ? T("previewEnd") : ok ? T("sent") : T("pending")(n);
  $("end-code").parentElement.hidden = PREVIEW;
  $("end-code-note").textContent = T("codeNote");
  $("end-code").textContent = S.pid;
  $("btn-retry").hidden = ok; $("btn-save").hidden = ok;
  $("end-lottery").textContent = S.lottery && !PREVIEW ? T("lotteryDone") : "";
}
function saveFile() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" }));
  a.download = `${bank.study_id}_${S.pid}.json`;
  document.body.append(a); a.click(); a.remove();
}

// ---------- large view ----------
let zoomIdx = null;
function openZoom(i) { zoomIdx = i; cur.zooms += 1; $("lightbox").hidden = false; renderZoom(); }
function zoomRef(src) {
  if (!cur) return;
  zoomIdx = null;
  $("lb-main").src = src; $("lb-closes").replaceChildren(); $("lb-refs").hidden = true;
  $("lb-ctl").hidden = true; $("lb-pos").textContent = ""; $("lb-state").textContent = ""; $("lb-q").textContent = "";
  $("lightbox").hidden = false; cur.zooms += 1;
}
function closeZoom() { zoomIdx = null; $("lightbox").hidden = true; }
function stepZoom(d) { if (zoomIdx == null) return; zoomIdx = (zoomIdx + d + cur.layout.length) % cur.layout.length; cur.zooms += 1; renderZoom(); }
function renderZoom() {
  const cid = cur.layout[zoomIdx], c = cur.byId[cid], it = cur.it;
  $("lb-ctl").hidden = false; $("lb-refs").hidden = false;
  $("lb-main").src = c.img;
  $("lb-closes").replaceChildren(...(c.closes || []).map((src) => { const x = el("img", "close"); x.src = src; x.alt = ""; return x; }));
  $("lb-refs").replaceChildren(...it.refs.map((r) => { const f = el("figure"); const x = el("img"); x.src = r.img; x.alt = ""; f.append(x, el("figcaption", null, T("cap")[r.role])); return f; }));
  $("lb-pos").textContent = `${zoomIdx + 1} / ${cur.layout.length}`;
  const r = cur.ranks[cur.crit], at = r.indexOf(cid);
  $("lb-state").textContent = at >= 0 ? `#${at + 1}` : "";
  $("lb-pick").textContent = at >= 0 ? T("unpick") : T("pickThis");
  $("lb-pick").disabled = cur.showFb;
  $("lb-q").textContent = stepText()[0];
}

function onKey(e) {
  if (!$("lightbox").hidden) {
    if (e.key === "Escape") closeZoom();
    else if (zoomIdx != null && e.key === "ArrowLeft") stepZoom(-1);
    else if (zoomIdx != null && e.key === "ArrowRight") stepZoom(1);
    else if (zoomIdx != null && e.key === "Enter") { e.preventDefault(); $("lb-pick").click(); }
    return;
  }
  if ($("v-trial").hidden || !cur) return;
  const x = document.activeElement;
  if (x && (x.tagName === "INPUT" || x.tagName === "TEXTAREA")) return;
  if (/^[1-9]$/.test(e.key) && +e.key <= cur.layout.length) { e.preventDefault(); act(cur.layout[+e.key - 1]); }
  else if (e.key === "Backspace") { e.preventDefault(); undo(); }
  else if (e.key === "Enter") {
    if (x && x.tagName === "BUTTON" && !x.classList.contains("tile-pick")) return;
    e.preventDefault(); next();
  }
}

init();
