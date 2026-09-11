import type { LanguageCode } from '../types';

export interface IvrLanguageConfig {
  key: string;
  name: string;
  nativeName: string;
  code: LanguageCode;
  voiceLangCode: string;
  flag: string;
}

export const IVR_LANGUAGES: IvrLanguageConfig[] = [
  { key: '1', name: 'English', nativeName: 'English', code: 'en', voiceLangCode: 'en-IN', flag: '🌐' },
  { key: '2', name: 'Hindi', nativeName: 'हिन्दी', code: 'hi', voiceLangCode: 'hi-IN', flag: '🇮🇳' },
  { key: '3', name: 'Marathi', nativeName: 'मराठी', code: 'mr', voiceLangCode: 'mr-IN', flag: '🇮🇳' },
  { key: '4', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa', voiceLangCode: 'pa-IN', flag: '🇮🇳' },
  { key: '5', name: 'Bengali', nativeName: 'বাংলা', code: 'bn', voiceLangCode: 'bn-IN', flag: '🇮🇳' },
];

export interface SymptomCategory {
  key: string;
  label: string;
  hindiLabel: string;
  specialty: string;
  department: string;
  assignedDoctor: string;
  roomNumber: string;
  isRedFlag: boolean;
  priority: 'P1_EMERGENCY' | 'P2_URGENT' | 'P3_ROUTINE';
  description: string;
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    key: '1',
    label: 'Fever / Cold / Cough / Body Pain',
    hindiLabel: 'बुखार / सर्दी / जुकाम / शरीर दर्द',
    specialty: 'General Medicine & Infectious Disease',
    department: 'Medicine OPD',
    assignedDoctor: 'Dr. Rajesh Sharma, MD',
    roomNumber: 'Room 04 (Ground Floor)',
    isRedFlag: false,
    priority: 'P3_ROUTINE',
    description: 'Acute febrile viral illness, upper respiratory tract symptoms, and generalized myalgia.',
  },
  {
    key: '2',
    label: 'Abdominal Pain / Gastric / Digestion',
    hindiLabel: 'पेट दर्द / गैस / बदहजमी / पेट की समस्या',
    specialty: 'Gastroenterology & Hepatology',
    department: 'Gastroenterology OPD',
    assignedDoctor: 'Dr. Meenakshi Sundaram, DM (Gastro)',
    roomNumber: 'Room 08 (1st Floor)',
    isRedFlag: false,
    priority: 'P2_URGENT',
    description: 'Acute to subacute epigastric discomfort, indigestion, gastritis, or colicky abdominal pain.',
  },
  {
    key: '3',
    label: 'Internal Body Pain / Chest Pain / Heart / Breathlessness',
    hindiLabel: 'सीने में दर्द / दिल की धड़कन / सांस फूलना (आपातकालीन)',
    specialty: 'Cardiology & Emergency Triage',
    department: 'Emergency Resuscitation & Cardiology OPD',
    assignedDoctor: 'Dr. Alok Verma, MD, DM (Cardiology)',
    roomNumber: 'Resuscitation Bay 1 / Room 12',
    isRedFlag: true,
    priority: 'P1_EMERGENCY',
    description: 'Potential Acute Coronary Syndrome, severe angina or acute cardiopulmonary compromise.',
  },
  {
    key: '4',
    label: 'External Body Pain / Bone / Joint / Ortho / Injury',
    hindiLabel: 'हड्डी / जोड़ / चोट / बाहरी शरीर का दर्द',
    specialty: 'Orthopedics & Joint Care',
    department: 'Orthopedics OPD',
    assignedDoctor: 'Dr. Harish Chandra, MS (Ortho)',
    roomNumber: 'Room 06 (Ground Floor)',
    isRedFlag: false,
    priority: 'P3_ROUTINE',
    description: 'Musculoskeletal sprains, degenerative osteoarthritis, lumbar strain, or peripheral joint stiffness.',
  },
];

export interface IvrPersona {
  abhaNumber: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  district: string;
  nearestHospital: string;
}

export const KNOWN_PERSONAS: IvrPersona[] = [
  {
    abhaNumber: '91-4829-1029-4481',
    name: 'Ramesh Kumar',
    age: 54,
    gender: 'MALE',
    phone: '+91 98765 43210',
    district: 'Central Delhi',
    nearestHospital: 'AIIMS New Delhi (Main OPD Block)',
  },
  {
    abhaNumber: '14-8921-3940-5912',
    name: 'Sunita Devi',
    age: 51,
    gender: 'FEMALE',
    phone: '+91 94150 11223',
    district: 'South Delhi',
    nearestHospital: 'Safdarjung Hospital, New Delhi',
  },
  {
    abhaNumber: '91-5544-8833-2211',
    name: 'Anjali Sharma',
    age: 46,
    gender: 'FEMALE',
    phone: '+91 98112 34567',
    district: 'New Delhi',
    nearestHospital: 'Dr. Ram Manohar Lohia Hospital, New Delhi',
  },
  {
    abhaNumber: '73-2940-1928-3019',
    name: 'Vikramaditya Joshi',
    age: 42,
    gender: 'MALE',
    phone: '+91 99887 76655',
    district: 'North Delhi',
    nearestHospital: 'All India Institute of Ayurveda (AIIA)',
  },
];

export const IVR_AUDIO_PROMPTS: Record<
  string,
  {
    greeting: string;
    langMenu: string;
    askAbha: string;
    verifying: string;
    verifiedSuccess: (name: string, hospital: string) => string;
    askSymptom: string;
    bookingSuccess: (hospital: string, token: string, doctor: string, room: string) => string;
    emergencyAlert: string;
  }
> = {
  en: {
    greeting: 'Welcome to Ayushman Bharat National Automated OPD Appointment and Triage Helpline.',
    langMenu: 'For English press 1. हिन्दी के लिए 2 दबाएं. मराठीसाठी 3 दाबा. ਪੰਜਾਬੀ ਲਈ 4 ਦਬਾਓ. বাংলা জন্য 5 চাপুন.',
    askAbha: 'Please enter your 14 digit ABHA Card Number on the keypad, or press 1 for instant demo verification.',
    verifying: 'Connecting to Ayushman Bharat Digital Mission gateway and verifying identity.',
    verifiedSuccess: (name, hospital) =>
      `Verification successful! Welcome ${name}. Your nearest allocated facility is ${hospital}.`,
    askSymptom:
      'For self-diagnosis routing: Press 1 for Fever, Cold, or Body Pain. Press 2 for Abdominal or Gastric pain. Press 3 for Internal Body Pain or Chest Pain. Press 4 for Bone, Joint or External pain.',
    bookingSuccess: (hospital, token, doctor, room) =>
      `Your appointment is confirmed at ${hospital}. Token Number is ${token}. Consulting Doctor is ${doctor} in ${room}. A confirmation SMS has been dispatched to your mobile phone. Thank you for using ABHA PRO.`,
    emergencyAlert:
      'CRITICAL TRIAGE ALERT: Internal chest pain detected. Priority emergency token issued. Please proceed immediately to the Emergency Room.',
  },
  hi: {
    greeting: 'आयुष्मान भारत राष्ट्रीय स्वचालित ओपीडी अपॉइंटमेंट हेल्पलाइन में आपका स्वागत है।',
    langMenu: 'अंग्रेजी के लिए 1 दबाएं। हिन्दी के लिए 2 दबाएं। मराठी के लिए 3 दबाएं। पंजाबी के लिए 4 दबाएं। बंगाली के लिए 5 दबाएं।',
    askAbha: 'कृपया कीपैड पर अपना 14 अंकों का आभा कार्ड नंबर दर्ज करें, या डेमो सत्यापन के लिए 1 दबाएं।',
    verifying: 'आयुष्मान भारत डिजिटल मिशन से पहचान की पुष्टि की जा रही है...',
    verifiedSuccess: (name, hospital) =>
      `सत्यापन सफल रहा! नमस्ते ${name} जी। आपका निकटतम अस्पताल ${hospital} है।`,
    askSymptom:
      'लक्षण चयन के लिए: बुखार, सर्दी या बदन दर्द के लिए 1 दबाएं। पेट दर्द या गैस की समस्या के लिए 2 दबाएं। सीने में दर्द या सांस फूलने के लिए 3 दबाएं। हड्डी या जोड़ दर्द के लिए 4 दबाएं।',
    bookingSuccess: (hospital, token, doctor, room) =>
      `आपकी ओपीडी बुकिंग ${hospital} में पक्की हो गई है। टोकन संख्या ${token} है। डॉक्टर ${doctor}, ${room} में परामर्श देंगे। पुष्टि एसएमएस आपके मोबाइल पर भेज दिया गया है। धन्यवाद।`,
    emergencyAlert:
      'आपातकालीन चेतावनी: सीने में दर्द के लिए आपातकालीन टोकन जारी किया गया है। कृपया तुरंत कैजुअल्टी वार्ड में जाएं।',
  },
  mr: {
    greeting: 'आयुष्मान भारत राष्ट्रीय स्वयंचलित ओपीडी नोंदणी हेल्पलाईनमध्ये आपले स्वागत आहे.',
    langMenu: 'इंग्रजीसाठी 1 दाबा. मराठीसाठी 3 दाबा.',
    askAbha: 'कृपया आपला 14 अंकी आभा कार्ड क्रमांक कीपॅडवर टाका किंवा डेमोसाठी 1 दाबा.',
    verifying: 'आभा डेटाबेसवरून ओळख पडताळणी केली जात आहे...',
    verifiedSuccess: (name, hospital) =>
      `पडताळणी यशस्वी! नमस्कार ${name}. आपले जवळचे रुग्णालय ${hospital} आहे.`,
    askSymptom:
      'ताप किंवा सर्दीसाठी 1 दाबा. पोटदुखीसाठी 2 दाबा. छातीत किंवा अंतर्गत वेदनेसाठी 3 दाबा. हाडांच्या किंवा सांधेदुखीसाठी 4 दाबा.',
    bookingSuccess: (hospital, token, doctor, room) =>
      `आपली नोंदणी ${hospital} येथे यशस्वी झाली आहे. टोकन क्रमांक ${token} आहे. डॉक्टर ${doctor}, ${room} मध्ये उपलब्ध असतील. एसएमएस पाठवला गेला आहे.`,
    emergencyAlert: 'तातडीची सूचना: कृपया त्वरित अतिदक्षता विभागात संपर्क साधावा.',
  },
  pa: {
    greeting: 'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਨੈਸ਼ਨਲ ਓਪੀਡੀ ਬੁਕਿੰਗ ਹੈਲਪਲਾਈਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।',
    langMenu: 'ਅੰਗਰੇਜ਼ੀ ਲਈ 1 ਦਬਾਓ. ਪੰਜਾਬੀ ਲਈ 4 ਦਬਾਓ.',
    askAbha: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ 14 ਅੰਕਾਂ ਦਾ ਆਭਾ ਕਾਰਡ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
    verifying: 'ਆਭਾ ਡਾਟਾਬੇਸ ਤੋਂ ਤਸਦੀਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    verifiedSuccess: (name, hospital) =>
      `ਤਸਦੀਕ ਸਫਲ ਰਹੀ! ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name} ਜੀ। ਤੁਹਾਡਾ ਹਸਪਤਾਲ ${hospital} ਹੈ।`,
    askSymptom:
      'ਬੁਖਾਰ ਜਾਂ ਖੰਘ ਲਈ 1 ਦਬਾਓ। ਪੇਟ ਦਰਦ ਲਈ 2 ਦਬਾਓ। ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਲਈ 3 ਦਬਾਓ। ਹੱਡੀਆਂ ਜਾਂ ਜੋੜਾਂ ਦੇ ਦਰਦ ਲਈ 4 ਦਬਾਓ।',
    bookingSuccess: (hospital, token, doctor, room) =>
      `ਤੁਹਾਡੀ ਬੁਕਿੰਗ ${hospital} ਵਿਖੇ ਕਾਮਯਾਬ ਹੋ ਗਈ ਹੈ। ਟੋਕਨ ਨੰਬਰ ${token} ਹੈ। ਡਾਕਟਰ ${doctor}, ${room} ਵਿੱਚ ਮਿਲਣਗੇ। ਐਸਐਮਐਸ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ।`,
    emergencyAlert: 'ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ: ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਰੂਮ ਵਿੱਚ ਜਾਓ।',
  },
  bn: {
    greeting: 'আয়ুষ্মান ভারত জাতীয় স্বয়ংক্রিয় ওপিডি হেল্পলাইনে আপনাকে স্বাগতম।',
    langMenu: 'ইংরেজির জন্য 1 চাপুন. বাংলার জন্য 5 চাপুন.',
    askAbha: 'অনুগ্রহ করে আপনার 14 ডিজিটের আভা কার্ড নম্বরটি টাইপ করুন।',
    verifying: 'আভা পরিচয় যাচাই করা হচ্ছে...',
    verifiedSuccess: (name, hospital) =>
      `যাচাইকরণ সফল! নমস্কার ${name}। আপনার নিকটবর্তী হাসপাতাল ${hospital}।`,
    askSymptom:
      'জ্বর বা কাশির জন্য 1 চাপুন। পেটের ব্যথার জন্য 2 চাপুন। বুকে ব্যথা বা শ্বাসকষ্টের জন্য 3 চাপুন। হাড় বা গাঁটের ব্যথার জন্য 4 চাপুন।',
    bookingSuccess: (hospital, token, doctor, room) =>
      `আপনার ওপিডি বুকিং ${hospital} এ নিশ্চিত হয়েছে। টোকেন নম্বর ${token}। ডাক্তার ${doctor}, ${room} এ উপস্থিত থাকবেন। ফোনে এসএমএস পাঠানো হয়েছে।`,
    emergencyAlert: 'জরুরি সতর্কতা: অবিলম্বে জরুরি বিভাগে যোগাযোগ করুন।',
  },
};
