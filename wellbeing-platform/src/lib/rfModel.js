import RF_CONFIG from '../../../inference_api/rf_config.json';

const featureDefinitions = [
  {
    feature: 'grp_aches',
    label: 'Physical aches',
    category: 'physical',
    cadence: 'weekly',
    importance: 0.22097917769986825,
    question: 'In the past 7 days, how often did you have headaches, stomachaches, backaches, or feel dizzy?',
    sourceCols: ['headache', 'stomachache', 'backache', 'dizzy'],
    isGroupedComposite: true,
    groupedFrom: ['Headache', 'Stomach ache', 'Back ache', 'Feeling dizzy'],
    aggregationMethod: 'take the most frequent out of all the symptoms',
    supportKey: 'physical_signal',
  },
  {
    feature: 'sleepdificulty',
    label: 'Sleep difficulty',
    category: 'physical',
    cadence: 'weekly',
    importance: 0.14510530393910856,
    question: 'In the past 7 days, how often was it hard for you to fall asleep or stay asleep?',
    sourceCols: ['sleepdificulty'],
    aggregationMethod: 'raw',
    supportKey: 'sleep_recovery',
  },
  {
    feature: 'health',
    label: 'Self-rated health',
    category: 'physical',
    cadence: 'monthly',
    importance: 0.06676630767142021,
    question: 'Over the past month, how would you describe your overall health?',
    sourceCols: ['health'],
    aggregationMethod: 'raw',
    supportKey: 'general_health',
  },
  {
    feature: 'grp_fam_sup',
    label: 'Family emotional support',
    category: 'family',
    cadence: 'monthly',
    importance: 0.05760702829951625,
    question: 'Over the past month, when you needed support, how supported have you felt by your family?',
    sourceCols: ['famsup', 'famtalk'],
    isGroupedComposite: true,
    groupedFrom: ['Get emotional help from family', 'Talk about problems with family'],
    aggregationMethod: 'mean',
    supportKey: 'family_support',
  },
  {
    feature: 'schoolpressure',
    label: 'School pressure',
    category: 'school',
    cadence: 'weekly',
    importance: 0.04139347092609204,
    question: 'In the past 7 days, how pressured did you feel by schoolwork?',
    sourceCols: ['schoolpressure'],
    aggregationMethod: 'raw',
    supportKey: 'school_pressure',
  },
  {
    feature: 'grp_talk_father',
    label: 'Talking to father',
    category: 'family',
    cadence: 'monthly',
    importance: 0.03761582386316818,
    question: 'Over the past month, if something was really bothering you, how easy was it to talk to your father about it?',
    sourceCols: ['talkfather'],
    aggregationMethod: 'raw',
    supportKey: 'family_support',
  },
  {
    feature: 'age',
    label: 'Age',
    category: 'baseline',
    cadence: 'one_time',
    importance: 0.02940598806153676,
    question: 'How old are you?',
    sourceCols: ['age'],
    aggregationMethod: 'raw',
    supportKey: null,
  },
  {
    feature: 'bodyheight',
    label: 'Height',
    category: 'baseline',
    cadence: 'one_time',
    importance: 0.024693731533525602,
    question: 'What is your height in centimetres?',
    sourceCols: ['bodyheight'],
    aggregationMethod: 'raw',
    supportKey: null,
  },
  {
    feature: 'bodyweight',
    label: 'Weight',
    category: 'baseline',
    cadence: 'one_time',
    importance: 0.02455775321754002,
    question: 'What is your weight in kilograms?',
    sourceCols: ['bodyweight'],
    aggregationMethod: 'raw',
    supportKey: null,
  },
  {
    feature: 'emcsocmed8',
    label: 'Social media: escape from negative feelings',
    category: 'digital',
    cadence: 'weekly',
    importance: 0.02056025326106545,
    question: 'In the past 7 days, did you use social media to feel better when you were upset?',
    sourceCols: ['emcsocmed8'],
    aggregationMethod: 'raw',
    supportKey: 'online_habits',
  },
  {
    feature: 'grp_online_contact',
    label: 'Online contact with friends',
    category: 'digital',
    cadence: 'weekly',
    importance: 0.020500101451244646,
    question: 'How often do you keep in online contact with your close friends, wider friend group, or friends you met online?',
    sourceCols: ['emconlfreq1', 'emconlfreq2', 'emconlfreq3'],
    isGroupedComposite: true,
    groupedFrom: ['Online contact with close friends', 'Online contact with larger friend group', 'Online contact with friends met online'],
    aggregationMethod: 'mean',
    supportKey: 'online_habits',
  },
  {
    feature: 'grp_sweets',
    label: 'Sweets and soft drinks',
    category: 'habits',
    cadence: 'weekly',
    importance: 0.02004546286158626,
    question: 'Across a usual week, how often do you have sweets or sugary soft drinks?',
    sourceCols: ['sweets_2', 'softdrinks_2'],
    isGroupedComposite: true,
    groupedFrom: ['Eat sweets', 'Drink coke / soft drinks'],
    aggregationMethod: 'mean',
    supportKey: 'movement_nutrition',
  },
  {
    feature: 'grp_talk_mother',
    label: 'Talking to mother',
    category: 'family',
    cadence: 'monthly',
    importance: 0.020023417541704263,
    question: 'Over the past month, if something was really bothering you, how easy was it to talk to your mother about it?',
    sourceCols: ['talkmother'],
    aggregationMethod: 'raw',
    supportKey: 'family_support',
  },
  {
    feature: 'grp_online_pref',
    label: 'Prefers sharing online',
    category: 'digital',
    cadence: 'weekly',
    importance: 0.01993633854289729,
    question: 'It feels easier to share secrets, feelings, or worries online than face to face.',
    sourceCols: ['emconlpref1', 'emconlpref2', 'emconlpref3'],
    isGroupedComposite: true,
    groupedFrom: ['Secrets are easier to discuss online', 'Feelings are easier to discuss online', 'Concerns are easier to discuss online'],
    aggregationMethod: 'mean',
    supportKey: 'online_habits',
  },
  {
    feature: 'grp_fruits',
    label: 'Fruit and vegetable intake',
    category: 'habits',
    cadence: 'weekly',
    importance: 0.019327026723889956,
    question: 'Across a usual week, how often do you eat fruits and vegetables?',
    sourceCols: ['fruits_2', 'vegetables_2'],
    isGroupedComposite: true,
    groupedFrom: ['Eat fruits', 'Eat vegetables'],
    aggregationMethod: 'mean',
    supportKey: 'movement_nutrition',
  },
  {
    feature: 'studaccept',
    label: 'Peer acceptance',
    category: 'school',
    cadence: 'monthly',
    importance: 0.018861629132989353,
    question: 'Over the past month, how accepted have you felt by other students?',
    sourceCols: ['studaccept'],
    aggregationMethod: 'raw',
    supportKey: 'school_belonging',
  },
  {
    feature: 'grp_friend',
    label: 'Trusted friends',
    category: 'peer',
    cadence: 'weekly',
    importance: 0.018522833974363703,
    question: 'I have friends I can count on and talk to when something is bothering me.',
    sourceCols: ['friendcounton', 'friendtalk'],
    isGroupedComposite: true,
    groupedFrom: ['Can count on friends', 'Can talk about problems with friends'],
    aggregationMethod: 'mean',
    supportKey: 'friendship_support',
  },
  {
    feature: 'physact60',
    label: '60-minute physical activity days',
    category: 'habits',
    cadence: 'weekly',
    importance: 0.01846441573511479,
    question: 'Over the past 7 days, on how many days were you physically active for a total of at least 60 minutes per day?',
    sourceCols: ['physact60'],
    aggregationMethod: 'raw',
    supportKey: 'movement_nutrition',
  },
  {
    feature: 'likeschool',
    label: 'Liking school',
    category: 'school',
    cadence: 'monthly',
    importance: 0.017613688432021598,
    question: 'Over the past month, how have you felt about school?',
    sourceCols: ['likeschool'],
    aggregationMethod: 'raw',
    supportKey: 'school_belonging',
  },
  {
    feature: 'grp_bfast',
    label: 'Breakfast routine',
    category: 'habits',
    cadence: 'monthly',
    importance: 0.016366567575604694,
    question: 'Over the past month, how regularly have you eaten breakfast on school days and weekends?',
    sourceCols: ['breakfastwd', 'breakfastwe'],
    isGroupedComposite: true,
    groupedFrom: ['Breakfast on weekdays', 'Breakfast on weekends'],
    aggregationMethod: 'sum - 2',
    supportKey: 'movement_nutrition',
  },
  {
    feature: 'grp_teacher',
    label: 'Teacher care and acceptance',
    category: 'school',
    cadence: 'monthly',
    importance: 0.016240873573690112,
    question: 'Over the past month, how much have your teachers cared about you and accepted you as you are?',
    sourceCols: ['teacheraccept', 'teachercare'],
    isGroupedComposite: true,
    groupedFrom: ['Teacher accepts me', 'Teacher cares about me'],
    aggregationMethod: 'mean',
    supportKey: 'school_belonging',
  },
  {
    feature: 'grp_been_bullied',
    label: 'Being bullied',
    category: 'peer',
    cadence: 'weekly',
    importance: 0.016068146901689083,
    question: 'In the past 7 days, how often were you bullied, either in school or online?',
    sourceCols: ['beenbullied', 'cbeenbullied'],
    isGroupedComposite: true,
    groupedFrom: ['Been bullied at school', 'Been cyberbullied'],
    aggregationMethod: 'take the most frequent',
    supportKey: 'bullying_safety',
  },
  {
    feature: 'timeexe',
    label: 'Exercise time outside school',
    category: 'habits',
    cadence: 'weekly',
    importance: 0.014180520153401016,
    question: 'Outside school hours: how often do you usually exercise in your free time so much that you get out of breath or sweat?',
    sourceCols: ['timeexe'],
    aggregationMethod: 'raw',
    supportKey: 'movement_nutrition',
  },
  {
    feature: 'friendhelp',
    label: 'Friends try to help',
    category: 'peer',
    cadence: 'weekly',
    importance: 0.013551837930866237,
    question: 'My friends really try to help me.',
    sourceCols: ['friendhelp'],
    aggregationMethod: 'raw',
    supportKey: 'friendship_support',
  },
  {
    feature: 'fasholidays',
    label: 'Family holidays',
    category: 'baseline',
    cadence: 'one_time',
    importance: 0.013078893951151962,
    question: 'During the past 12 months, how many times did you travel away on holiday/vacation with your family?',
    sourceCols: ['fasholidays'],
    aggregationMethod: 'raw',
    supportKey: null,
  },
  {
    feature: 'studhelpful',
    label: 'Helpful classmates',
    category: 'school',
    cadence: 'monthly',
    importance: 0.012873520300571173,
    question: 'Over the past month, how kind and helpful have your classmates been?',
    sourceCols: ['studhelpful'],
    aggregationMethod: 'raw',
    supportKey: 'school_belonging',
  },
  {
    feature: 'sex',
    label: 'Sex',
    category: 'baseline',
    cadence: 'one_time',
    importance: 0.011653164355934142,
    question: 'What is your sex?',
    sourceCols: ['sex'],
    aggregationMethod: 'raw',
    supportKey: null,
  },
  {
    feature: 'teachertrust',
    label: 'Trust in teachers',
    category: 'school',
    cadence: 'weekly',
    importance: 0.01149061214682964,
    question: 'I feel a lot of trust in my teachers.',
    sourceCols: ['teachertrust'],
    aggregationMethod: 'raw',
    supportKey: 'school_belonging',
  },
  {
    feature: 'famdec',
    label: 'Voice in family decisions',
    category: 'family',
    cadence: 'monthly',
    importance: 0.011223759015154275,
    question: 'Over the past month, how willing has your family been to help you make decisions?',
    sourceCols: ['famdec'],
    aggregationMethod: 'raw',
    supportKey: 'family_support',
  },
  {
    feature: 'famhelp',
    label: 'Family willingness to help',
    category: 'family',
    cadence: 'monthly',
    importance: 0.01498916209244288,
    question: 'Over the past month, how willing has your family been to help you when you needed it?',
    sourceCols: ['famhelp'],
    aggregationMethod: 'raw',
    supportKey: 'family_support',
  },
  {
    feature: 'fmeal',
    label: 'Family meals',
    category: 'family',
    cadence: 'weekly',
    importance: 0.01106442602215908,
    question: 'How often do you usually have meals together with your family?',
    sourceCols: ['fmeal'],
    aggregationMethod: 'raw',
    supportKey: 'family_support',
  },
  {
    feature: 'thinkbody',
    label: 'Body image',
    category: 'self_image',
    cadence: 'monthly',
    importance: 0.01022792520429548,
    question: 'Over the past month, how have you felt about how your body looks?',
    sourceCols: ['thinkbody'],
    aggregationMethod: 'raw',
    supportKey: 'self_image',
  },
];

const selectedFeatureImportances = {
  ...(RF_CONFIG.importances || {}),
  grp_talk_father: RF_CONFIG.importances?.talkfather,
  grp_talk_mother: RF_CONFIG.importances?.talkmother,
};

export const categoryLabels = {
  baseline: 'Asked once',
  physical: 'Physical wellbeing',
  habits: 'Routines and health habits',
  school: 'School experience',
  peer: 'Peer support and safety',
  digital: 'Online life',
  family: 'Family connection',
  self_image: 'Body image',
};

export const cadenceLabels = {
  one_time: 'Asked once',
  weekly: 'Weekly pulse',
  monthly: 'Monthly refresh',
};

const symptomFrequencyOptions = [
  { value: 1, label: 'Never' },
  { value: 2, label: '1–2 times this week' },
  { value: 3, label: '3–4 times this week' },
  { value: 4, label: '5–6 times this week' },
  { value: 5, label: 'Every day' },
];

const sleepDifficultyOptions = [
  { value: 1, label: 'Never' },
  { value: 2, label: '1–2 times this week' },
  { value: 3, label: '3–4 times this week' },
  { value: 4, label: '5–6 times this week' },
  { value: 5, label: 'Every day' },
];

const agreementOptions = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither agree nor disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];

const schoolSupportOptions = [
  { value: 1, label: 'Strongly agree' },
  { value: 2, label: 'Agree' },
  { value: 3, label: 'Neither agree nor disagree' },
  { value: 4, label: 'Disagree' },
  { value: 5, label: 'Strongly disagree' },
];

const familyFriendSupportOptions = [
  { value: 7, label: 'Very strongly agree' },
  { value: 6, label: 'Strongly agree' },
  { value: 5, label: 'Agree' },
  { value: 4, label: 'Neither agree nor disagree' },
  { value: 3, label: 'Disagree' },
  { value: 2, label: 'Strongly disagree' },
  { value: 1, label: 'Very strongly disagree' },
];

const familySupportOptions = [
  { value: 1, label: 'Very supported' },
  { value: 2, label: 'Supported' },
  { value: 3, label: 'Slightly supported' },
  { value: 4, label: 'Neither supported nor unsupported' },
  { value: 5, label: 'Slightly unsupported' },
  { value: 6, label: 'Unsupported' },
  { value: 7, label: 'Very unsupported' },
];

const easeTalkOptions = [
  { value: 1, label: 'Very easy' },
  { value: 2, label: 'Quite easy' },
  { value: 3, label: 'Not sure' },
  { value: 4, label: 'Quite difficult' },
  { value: 5, label: 'Very difficult / not possible' },
];

const schoolPressureOptions = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'A little' },
  { value: 3, label: 'Some' },
  { value: 4, label: 'A lot' },
];

const healthOptions = [
  { value: 1, label: 'Very good' },
  { value: 2, label: 'Good' },
  { value: 3, label: 'Fair' },
  { value: 4, label: 'Poor' },
];

const schoolLikeOptions = [
  { value: 1, label: 'Very positive' },
  { value: 2, label: 'Mostly positive' },
  { value: 3, label: 'Mostly negative' },
  { value: 4, label: 'Very negative' },
];

const peerAcceptanceOptions = [
  { value: 1, label: 'Very accepted' },
  { value: 2, label: 'Accepted' },
  { value: 3, label: 'Sometimes accepted' },
  { value: 4, label: 'Often left out' },
  { value: 5, label: 'Not accepted at all' },
];

const classroomHelpfulnessOptions = [
  { value: 1, label: 'Very kind and helpful' },
  { value: 2, label: 'Kind and helpful' },
  { value: 3, label: 'Sometimes kind and helpful' },
  { value: 4, label: 'Often not kind or helpful' },
  { value: 5, label: 'Not kind or helpful at all' },
];

const bodyImageOptions = [
  { value: 1, label: 'Much too thin' },
  { value: 2, label: 'A bit too thin' },
  { value: 3, label: 'About the right size' },
  { value: 4, label: 'A bit too fat' },
  { value: 5, label: 'Much too fat' },
];

const daysOptions = Array.from({ length: 8 }, (_, index) => ({
  value: index,
  label: `${index} day${index === 1 ? '' : 's'}`,
}));

const descendingDaysOptions = [...daysOptions].reverse();

const holidaysOptions = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Once' },
  { value: 3, label: 'Twice' },
  { value: 4, label: 'More than twice' },
];

const weeklyFoodFrequencyOptions = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Less than once a week' },
  { value: 3, label: 'Once a week' },
  { value: 4, label: '2-4 days a week' },
  { value: 5, label: '5-6 days a week' },
  { value: 6, label: 'Once every day' },
  { value: 7, label: 'Every day, more than once' },
];

const weeklyHealthyFoodFrequencyOptions = [...weeklyFoodFrequencyOptions].reverse();

const familyMealsOptions = [
  { value: 1, label: 'Every day' },
  { value: 2, label: 'Most days' },
  { value: 3, label: 'About once a week' },
  { value: 4, label: 'Less often' },
  { value: 5, label: 'Never' },
];

const vigorousExerciseOptions = [
  { value: 1, label: 'Every day' },
  { value: 2, label: '4-6 times a week' },
  { value: 3, label: '2-3 times a week' },
  { value: 4, label: 'Once a week' },
  { value: 5, label: 'Once a month' },
  { value: 6, label: 'Less than once a month' },
  { value: 7, label: 'Never' },
];

const bullyingOptions = [
  { value: 1, label: 'Never' },
  { value: 2, label: '1–2 times this week' },
  { value: 3, label: '3–4 times this week' },
  { value: 4, label: '5–6 times this week' },
  { value: 5, label: 'Every day' },
];

const onlineContactOptions = [
  { value: 1, label: "Does not concern me / I don't know" },
  { value: 2, label: 'Never or hardly ever' },
  { value: 3, label: 'At least every week' },
  { value: 4, label: 'Daily or almost daily' },
  { value: 5, label: 'Several times a day' },
  { value: 6, label: 'Almost all the time' },
];

const yesNoOptions = [
  { value: 1, label: 'No' },
  { value: 2, label: 'Yes' },
];

const sexOptions = [
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
];

const featureResponseMeta = {
  grp_aches: {
    responseType: 'choice',
    options: symptomFrequencyOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'stress',
  },
  sleepdificulty: {
    responseType: 'choice',
    options: sleepDifficultyOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'sleep',
  },
  health: {
    responseType: 'choice',
    options: healthOptions,
    min: 1,
    max: 4,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'mood',
  },
  grp_fam_sup: {
    responseType: 'choice',
    options: familySupportOptions,
    min: 1,
    max: 7,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  schoolpressure: {
    responseType: 'choice',
    options: schoolPressureOptions,
    min: 1,
    max: 4,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'stress',
  },
  grp_talk_father: {
    responseType: 'choice',
    options: easeTalkOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  age: {
    responseType: 'number',
    min: 11,
    max: 18,
    step: 1,
    placeholder: 'Enter age',
    suffix: 'years',
    riskDirection: 'higher',
    useInScore: true,
    scoreStrategy: 'age',
  },
  bodyheight: {
    responseType: 'number',
    min: 120,
    max: 220,
    step: 1,
    placeholder: 'Enter height',
    suffix: 'cm',
    riskDirection: 'context',
    useInScore: false,
  },
  bodyweight: {
    responseType: 'number',
    min: 25,
    max: 180,
    step: 1,
    placeholder: 'Enter weight',
    suffix: 'kg',
    riskDirection: 'context',
    useInScore: false,
  },
  emcsocmed8: {
    responseType: 'choice',
    options: yesNoOptions,
    min: 1,
    max: 2,
    riskDirection: 'higher',
    missingValues: [99],
    useInScore: true,
    summaryBucket: 'mood',
  },
  grp_online_contact: {
    responseType: 'choice',
    options: onlineContactOptions,
    min: 1,
    max: 6,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'social',
  },
  grp_sweets: {
    responseType: 'choice',
    options: weeklyFoodFrequencyOptions,
    min: 1,
    max: 7,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'mood',
  },
  grp_talk_mother: {
    responseType: 'choice',
    options: easeTalkOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  grp_online_pref: {
    responseType: 'choice',
    options: agreementOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    missingValues: [99],
    useInScore: true,
    summaryBucket: 'mood',
  },
  grp_fruits: {
    responseType: 'choice',
    options: weeklyHealthyFoodFrequencyOptions,
    min: 1,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'mood',
  },
  studaccept: {
    responseType: 'choice',
    options: peerAcceptanceOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  grp_friend: {
    responseType: 'choice',
    options: familyFriendSupportOptions,
    min: 1,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'social',
  },
  physact60: {
    responseType: 'choice',
    options: descendingDaysOptions,
    min: 0,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'mood',
  },
  likeschool: {
    responseType: 'choice',
    options: schoolLikeOptions,
    min: 1,
    max: 4,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'mood',
  },
  grp_bfast: {
    responseType: 'choice',
    options: descendingDaysOptions,
    min: 0,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'mood',
  },
  grp_teacher: {
    responseType: 'choice',
    options: schoolSupportOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  grp_been_bullied: {
    responseType: 'choice',
    options: bullyingOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'stress',
  },
  timeexe: {
    responseType: 'choice',
    options: vigorousExerciseOptions,
    min: 1,
    max: 7,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'mood',
  },
  friendhelp: {
    responseType: 'choice',
    options: familyFriendSupportOptions,
    min: 1,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'social',
  },
  fasholidays: {
    responseType: 'choice',
    options: holidaysOptions,
    min: 1,
    max: 4,
    riskDirection: 'lower',
    useInScore: true,
  },
  studhelpful: {
    responseType: 'choice',
    options: classroomHelpfulnessOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  sex: {
    responseType: 'choice',
    options: sexOptions,
    riskDirection: 'context',
    useInScore: false,
  },
  teachertrust: {
    responseType: 'choice',
    options: schoolSupportOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  famdec: {
    responseType: 'choice',
    options: familyFriendSupportOptions,
    min: 1,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'social',
  },
  famhelp: {
    responseType: 'choice',
    options: familyFriendSupportOptions,
    min: 1,
    max: 7,
    riskDirection: 'lower',
    useInScore: true,
    summaryBucket: 'social',
  },
  fmeal: {
    responseType: 'choice',
    options: familyMealsOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'social',
  },
  thinkbody: {
    responseType: 'choice',
    options: bodyImageOptions,
    min: 1,
    max: 5,
    riskDirection: 'higher',
    useInScore: true,
    summaryBucket: 'mood',
  },
};

export const MONITOR_THRESHOLD = RF_CONFIG.thresholds.monitor_75th;
export const FLAG_THRESHOLD = RF_CONFIG.thresholds.flag_85th;
export const DISTRESS_THRESHOLD = MONITOR_THRESHOLD;
export const HIGH_DISTRESS_THRESHOLD = FLAG_THRESHOLD;

export const HELPLINE_DIRECTORY = {
  heading: "If you'd like to talk to someone",
  items: [
    {
      key: 'school_counsellor',
      label: 'Your school counsellor',
      detail: 'Ask any teacher, or visit the counselling room directly.',
      kind: 'support',
    },
    {
      key: 'samaritans_of_singapore',
      label: 'Samaritans of Singapore (24-hour)',
      detail: '24-hour helpline.',
      phone: '1-767',
      kind: 'phone',
    },
    {
      key: 'national_mindline',
      label: 'National Mindline (24-hour)',
      detail: 'Call 1-771 · WhatsApp 6669-1771',
      kind: 'phone',
    },
    {
      key: 'reach',
      label: "Singapore Children's Society - REACH",
      siteLabel: 'reach.org.sg',
      href: 'https://reach.org.sg',
      kind: 'link',
    },
    {
      key: 'mindline_site',
      label: 'mindline.sg',
      detail: 'Free online mental health support.',
      siteLabel: 'mindline.sg',
      href: 'https://www.mindline.sg',
      kind: 'link',
    },
  ],
};

const allQuestionDefinitions = featureDefinitions.map((feature) => ({
  ...feature,
  ...featureResponseMeta[feature.feature],
  categoryLabel: categoryLabels[feature.category] || feature.category,
}));

export const rfQuestionBank = allQuestionDefinitions
  .filter((feature) => selectedFeatureImportances[feature.feature] !== undefined)
  .map((feature) => ({
    ...feature,
    importance: selectedFeatureImportances[feature.feature],
  }));

export const rfQuestionLookup = Object.fromEntries(
  rfQuestionBank.map((feature) => [feature.feature, feature]),
);

const allFeatureLookup = Object.fromEntries(
  allQuestionDefinitions.map((feature) => [feature.feature, feature]),
);

const featureLabelLookup = Object.fromEntries(
  allQuestionDefinitions.map((feature) => [feature.label.toLowerCase(), feature]),
);

const categoryDisplayOrder = {
  baseline: 0,
  physical: 1,
  habits: 2,
  school: 3,
  peer: 4,
  family: 5,
  digital: 6,
  self_image: 7,
};

const featureDisplayOrder = Object.fromEntries(
  featureDefinitions.map((feature, index) => [feature.feature, index]),
);

function sortQuestionsForDisplay(questions = []) {
  return questions
    .slice()
    .sort((a, b) => (
      (categoryDisplayOrder[a.category] ?? 99) - (categoryDisplayOrder[b.category] ?? 99)
      || (featureDisplayOrder[a.feature] ?? 999) - (featureDisplayOrder[b.feature] ?? 999)
      || (a.label || '').localeCompare(b.label || '')
    ));
}

export const oneTimeQuestions = sortQuestionsForDisplay(
  rfQuestionBank.filter((feature) => feature.cadence === 'one_time'),
);
export const weeklyQuestions = sortQuestionsForDisplay(
  rfQuestionBank.filter((feature) => feature.cadence === 'weekly'),
);
export const monthlyQuestions = sortQuestionsForDisplay(
  rfQuestionBank.filter((feature) => feature.cadence === 'monthly'),
);
export const recurringQuestions = sortQuestionsForDisplay(
  rfQuestionBank.filter((feature) => feature.cadence !== 'one_time'),
);

export const questionBankStats = {
  total: rfQuestionBank.length,
  oneTime: oneTimeQuestions.length,
  weekly: weeklyQuestions.length,
  monthly: monthlyQuestions.length,
  groupedComposite: rfQuestionBank.filter((feature) => feature.isGroupedComposite).length,
  byCategory: Object.entries(
    rfQuestionBank.reduce((acc, feature) => {
      acc[feature.category] = (acc[feature.category] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([category, count]) => ({
      category,
      label: categoryLabels[category] || category,
      count,
    }))
    .sort((a, b) => b.count - a.count),
};

export function getFeatureById(featureId) {
  return rfQuestionLookup[featureId] || allFeatureLookup[featureId] || null;
}

export function getFeatureByLabel(label) {
  if (!label) return null;
  return featureLabelLookup[String(label).trim().toLowerCase()] || null;
}

export function getResponseLabel(featureOrId, value) {
  const feature = typeof featureOrId === 'string'
    ? getFeatureById(featureOrId)
    : featureOrId;
  if (!feature) return String(value ?? '');
  const option = (feature.options || []).find((item) => String(item.value) === String(value));
  if (option) return option.label;
  if (value === null || value === undefined || value === '') return 'No response';
  return String(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function scoreToSeverity(score) {
  if (score >= 5) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export function scoreToSeverityFromRisk(riskScore) {
  if (riskScore >= 0.82) return 'high';
  if (riskScore >= 0.64) return 'medium';
  return 'low';
}

function hasLegacyCheckInFields(answers = {}) {
  return ['q_sleep', 'q_energy', 'q_school_pressure', 'q_focus', 'q_social', 'q_overwhelmed']
    .some((key) => answers[key] !== undefined && answers[key] !== null && answers[key] !== '');
}

function hasRfFeatureAnswers(answers = {}) {
  return recurringQuestions.some((feature) => (
    answers[feature.feature] !== undefined && answers[feature.feature] !== null && answers[feature.feature] !== ''
  ));
}

export function isQuestionAnswered(feature, value) {
  if (!feature) return false;
  if (feature.responseType === 'number') return toNumber(value) !== null;
  return value !== undefined && value !== null && value !== '';
}

export function getMissingOneTimeFeatureIds(baselineResponses = {}) {
  return oneTimeQuestions
    .filter((feature) => !isQuestionAnswered(feature, baselineResponses[feature.feature]))
    .map((feature) => feature.feature);
}

export function hasCompletedOnboarding(baselineResponses = {}) {
  return getMissingOneTimeFeatureIds(baselineResponses).length === 0;
}

export function getFeatureRiskContribution(featureOrId, rawValue) {
  const feature = typeof featureOrId === 'string'
    ? getFeatureById(featureOrId)
    : featureOrId;

  if (!feature || !feature.useInScore || rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  const numeric = toNumber(rawValue);
  if (numeric === null) return null;
  if (feature.missingValues?.includes(numeric)) return null;

  if (feature.scoreStrategy === 'age') {
    return clamp((numeric - feature.min) / (feature.max - feature.min), 0, 1);
  }

  if (feature.scoreStrategy === 'holidays') {
    return 1 - clamp((numeric - feature.min) / (feature.max - feature.min), 0, 1);
  }

  if (feature.min === undefined || feature.max === undefined) return null;

  const normalized = clamp((numeric - feature.min) / (feature.max - feature.min), 0, 1);
  return feature.riskDirection === 'higher' ? normalized : 1 - normalized;
}

export function getSignalDirection(feature) {
  if (!feature) return 'watch';
  if (['grp_fam_sup', 'grp_friend', 'friendhelp', 'famdec', 'grp_online_contact', 'studaccept', 'studhelpful', 'grp_teacher', 'teachertrust'].includes(feature.feature)) {
    return 'declining';
  }
  if (['grp_talk_father', 'grp_talk_mother'].includes(feature.feature)) return 'harder';
  if (['grp_bfast', 'grp_fruits', 'physact60', 'timeexe', 'fmeal'].includes(feature.feature)) return 'less consistent';
  if (feature.feature === 'health') return 'dropping';
  if (feature.feature === 'grp_been_bullied') return 'increasing';
  if (feature.feature === 'likeschool') return 'shifting';
  if (feature.category === 'school') return 'rising';
  if (feature.riskDirection === 'lower') return 'dropping';
  return 'worsening';
}

function average(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getBucketProtectiveScore(answers = {}, bucket) {
  const values = weeklyQuestions
    .filter((feature) => feature.summaryBucket === bucket)
    .map((feature) => getFeatureRiskContribution(feature, answers[feature.feature]))
    .filter((value) => value !== null);

  const meanRisk = average(values);
  if (meanRisk === null) return 3;
  return clamp(Math.round(5 - (meanRisk * 4)), 1, 5);
}

function deriveLegacySignalsFromAnswers(answers = {}) {
  const signals = [];
  const sleepScore = Number(answers.q_sleep || 3);
  const energyScore = Number(answers.q_energy || 3);
  const pressureScore = Number(answers.q_school_pressure || 3);
  const focusScore = Number(answers.q_focus || 3);
  const socialScore = Number(answers.q_social || 3);
  const overwhelmedScore = Number(answers.q_overwhelmed || 3);

  if (sleepScore >= 4) {
    signals.push({ feature: 'sleepdificulty', severity: scoreToSeverity(sleepScore), direction: 'worsening' });
  }

  if (energyScore >= 4) {
    signals.push({ feature: 'health', severity: scoreToSeverity(energyScore), direction: 'declining' });
  }

  if (pressureScore <= 2) {
    signals.push({
      feature: 'schoolpressure',
      severity: pressureScore === 1 ? 'high' : 'medium',
      direction: 'increasing',
    });
  }

  if (focusScore >= 4) {
    signals.push({ feature: 'likeschool', severity: scoreToSeverity(focusScore), direction: 'shifting' });
  }

  if (socialScore <= 2) {
    signals.push({
      feature: 'grp_friend',
      severity: socialScore === 1 ? 'high' : 'medium',
      direction: 'declining',
    });
  }

  if (overwhelmedScore >= 4) {
    signals.push({ feature: 'grp_aches', severity: scoreToSeverity(overwhelmedScore), direction: 'rising' });
  }

  return signals;
}

export function deriveSignalsFromCheckInAnswers(answers = {}) {
  if (!hasRfFeatureAnswers(answers) && hasLegacyCheckInFields(answers)) {
    return deriveLegacySignalsFromAnswers(answers)
      .sort((a, b) => {
        const aFeature = getFeatureById(a.feature);
        const bFeature = getFeatureById(b.feature);
        return (bFeature?.importance || 0) - (aFeature?.importance || 0);
      });
  }

  return recurringQuestions
    .map((feature) => {
      const risk = getFeatureRiskContribution(feature, answers[feature.feature]);
      if (risk === null || risk < 0.64) return null;

      return {
        feature: feature.feature,
        severity: scoreToSeverityFromRisk(risk),
        direction: getSignalDirection(feature),
        risk,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.risk !== a.risk) return b.risk - a.risk;
      return (getFeatureById(b.feature)?.importance || 0) - (getFeatureById(a.feature)?.importance || 0);
    });
}

export function deriveStrengthHighlights(answers = {}, limit = 2) {
  if (!hasRfFeatureAnswers(answers)) return [];

  return recurringQuestions
    .map((feature) => {
      const risk = getFeatureRiskContribution(feature, answers[feature.feature]);
      if (risk === null || risk > 0.32) return null;
      return { feature, risk };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.risk !== b.risk) return a.risk - b.risk;
      return (b.feature.importance || 0) - (a.feature.importance || 0);
    })
    .slice(0, limit)
    .map(({ feature }) => feature);
}

export function buildLegacyCheckInFields(answers = {}) {
  if (!hasRfFeatureAnswers(answers) && hasLegacyCheckInFields(answers)) {
    return {
      q_sleep: Number(answers.q_sleep || 3),
      q_energy: Number(answers.q_energy || 3),
      q_school_pressure: Number(answers.q_school_pressure || 3),
      q_focus: Number(answers.q_focus || 3),
      q_social: Number(answers.q_social || 3),
      q_overwhelmed: Number(answers.q_overwhelmed || 3),
    };
  }

  const sleep = getBucketProtectiveScore(answers, 'sleep');
  const stress = getBucketProtectiveScore(answers, 'stress');
  const mood = getBucketProtectiveScore(answers, 'mood');
  const social = getBucketProtectiveScore(answers, 'social');

  return {
    q_sleep: clamp(6 - sleep, 1, 5),
    q_energy: clamp(6 - Math.round((sleep + mood) / 2), 1, 5),
    q_school_pressure: clamp(stress, 1, 5),
    q_focus: clamp(6 - Math.round((sleep + mood + stress) / 3), 1, 5),
    q_social: clamp(social, 1, 5),
    q_overwhelmed: clamp(6 - stress, 1, 5),
  };
}

export function computeCheckInScore(weeklyAnswers = {}, baselineResponses = {}) {
  if (!hasRfFeatureAnswers(weeklyAnswers) && hasLegacyCheckInFields(weeklyAnswers)) {
    const values = {
      q_sleep: Number(weeklyAnswers.q_sleep || 3),
      q_energy: Number(weeklyAnswers.q_energy || 3),
      q_school_pressure: Number(weeklyAnswers.q_school_pressure || 3),
      q_focus: Number(weeklyAnswers.q_focus || 3),
      q_social: Number(weeklyAnswers.q_social || 3),
      q_overwhelmed: Number(weeklyAnswers.q_overwhelmed || 3),
    };

    const total =
      values.q_sleep +
      values.q_energy +
      (6 - values.q_school_pressure) +
      values.q_focus +
      (6 - values.q_social) +
      values.q_overwhelmed;

    return Math.round((total / (6 * 5)) * 100);
  }

  const combinedAnswers = { ...baselineResponses, ...weeklyAnswers };
  const scoredFeatures = rfQuestionBank
    .map((feature) => {
      const risk = getFeatureRiskContribution(feature, combinedAnswers[feature.feature]);
      if (risk === null) return null;
      return { risk, weight: feature.importance };
    })
    .filter(Boolean);

  if (scoredFeatures.length === 0) return 0;

  const totalWeight = scoredFeatures.reduce((sum, item) => sum + item.weight, 0);
  const weightedRisk = scoredFeatures.reduce((sum, item) => sum + (item.risk * item.weight), 0) / totalWeight;
  return Math.round(weightedRisk * 100);
}

export function buildWeeklyScoreSnapshot(answers = {}, week, baselineResponses = {}) {
  if (!hasRfFeatureAnswers(answers) && hasLegacyCheckInFields(answers)) {
    const sleep = 6 - Number(answers.q_sleep || 3);
    const stress = Math.round(((Number(answers.q_school_pressure || 3)) + (6 - Number(answers.q_overwhelmed || 3))) / 2);
    const mood = Math.round(((6 - Number(answers.q_energy || 3)) + (6 - Number(answers.q_focus || 3))) / 2);
    const social = Number(answers.q_social || 3);
    const score = computeCheckInScore(answers);

    return {
      week,
      score,
      sleep,
      stress,
      mood,
      social,
    };
  }

  const sleep = getBucketProtectiveScore(answers, 'sleep');
  const stress = getBucketProtectiveScore(answers, 'stress');
  const mood = getBucketProtectiveScore(answers, 'mood');
  const social = getBucketProtectiveScore(answers, 'social');
  const score = computeCheckInScore(answers, baselineResponses);

  return {
    week,
    score,
    sleep,
    stress,
    mood,
    social,
  };
}

export function buildKeyFactorsFromCheckInAnswers(answers = {}) {
  return deriveSignalsFromCheckInAnswers(answers)
    .slice(0, 3)
    .map((signal) => {
      const feature = getFeatureById(signal.feature);
      return {
        factor: feature?.label || signal.feature,
        direction: signal.direction,
        severity: signal.severity,
      };
    });
}

export function deriveRiskLevel(score) {
  if (score >= FLAG_THRESHOLD) return 'high';
  if (score >= MONITOR_THRESHOLD) return 'medium';
  return 'low';
}

export function deriveTrendFromScores(weeklyScores = []) {
  if (weeklyScores.length < 3) return 'stable';
  const last3 = weeklyScores.slice(-3).map((item) => item.score || 0);
  if (last3[0] < last3[1] && last3[1] < last3[2]) return 'worsening';
  if (last3[0] > last3[1] && last3[1] > last3[2]) return 'improving';
  return 'stable';
}

export function deriveConfidenceFromScores(weeklyScores = [], signals = []) {
  const streak = getConsecutiveDistressWeeks(weeklyScores);
  const strongestSeverity = signals[0]?.severity;
  if (streak >= 3 || strongestSeverity === 'high') return 87;
  if (strongestSeverity === 'medium') return 78;
  return 72;
}

export function getRecommendedAction(student) {
  const streak = getConsecutiveDistressWeeks(student.weekly_scores || []);
  const score = Number(student.risk_score || 0);

  if (score >= FLAG_THRESHOLD && streak >= 3) {
    return {
      key: 'escalate',
      action: 'Escalate to Counsellor',
      urgency: 'urgent',
      description: 'The student is flagged for review and has shown a sustained elevated pattern across 3 weeks.',
    };
  }

  if (score >= FLAG_THRESHOLD) {
    return {
      key: 'check_in',
      action: 'Check in Privately',
      urgency: 'soon',
      description: `The latest score is in the flagged band (${FLAG_THRESHOLD.toFixed(2)}+). Start with a supportive private check-in this week.`,
    };
  }

  if (streak >= 3) {
    return {
      key: 'check_in',
      action: 'Check in Privately',
      urgency: 'soon',
      description: `The student has stayed in the monitoring band for ${streak} consecutive weeks and should be reviewed closely.`,
    };
  }

  if (score >= MONITOR_THRESHOLD || (student.risk_level === 'medium' && student.trend === 'worsening')) {
    return {
      key: 'monitor',
      action: 'Monitor for 2 Weeks',
      urgency: 'normal',
      description: `The student is in the monitoring band (${MONITOR_THRESHOLD.toFixed(2)}+) or showing an upward trend. Set a review reminder.`,
    };
  }

  return {
    key: 'routine',
    action: 'Continue Routine Support',
    urgency: 'low',
    description: 'Student responses are currently below the monitoring threshold and do not show a sustained concerning pattern.',
  };
}

export function getConsecutiveDistressWeeks(weeklyScores, threshold = DISTRESS_THRESHOLD) {
  let streak = 0;
  for (let index = weeklyScores.length - 1; index >= 0; index -= 1) {
    if ((weeklyScores[index]?.score || 0) >= threshold) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function hasThreeWeekDistressFlag(weeklyScores, threshold = DISTRESS_THRESHOLD) {
  return getConsecutiveDistressWeeks(weeklyScores, threshold) >= 3;
}

export function hasTwoWeekElevatedPattern(weeklyScores, threshold = DISTRESS_THRESHOLD) {
  return getConsecutiveDistressWeeks(weeklyScores, threshold) >= 2;
}

export function hasSustainedIncrease(weeklyScores) {
  if (!weeklyScores || weeklyScores.length < 3) return false;
  const last3 = weeklyScores.slice(-3);
  return last3[0].score < last3[1].score && last3[1].score < last3[2].score;
}

export const signalLabelByFeature = {
  grp_aches: 'Physical aches',
  health: 'Overall health',
  sleepdificulty: 'Sleep difficulty',
  schoolpressure: 'School pressure',
  likeschool: 'School feelings',
  grp_been_bullied: 'Bullying',
  studaccept: 'Peer acceptance',
  studhelpful: 'Classmate support',
  grp_fam_sup: 'Family support',
  grp_talk_father: 'Talking to father',
  grp_talk_mother: 'Talking to mother',
  emcsocmed8: 'Social media coping',
};

export function formatSignalLabel(featureId) {
  return signalLabelByFeature[featureId] || getFeatureById(featureId)?.label || featureId;
}

export function getSignalArrow(direction) {
  if (['worsening', 'increasing', 'rising'].includes(direction)) return '↑';
  if (['declining', 'dropping', 'harder', 'less consistent'].includes(direction)) return '↓';
  return '→';
}

const supportCategoryByFeature = {
  grp_aches: 'physical',
  health: 'physical',
  sleepdificulty: 'sleep',
  schoolpressure: 'school_stress',
  likeschool: 'school_stress',
  grp_bfast: 'breakfast_habits',
  grp_been_bullied: 'bullying',
  grp_teacher: 'teacher_support',
  studaccept: 'social_peers',
  studhelpful: 'social_peers',
  famdec: 'family_support',
  famhelp: 'family_support',
  thinkbody: 'body_image',
  grp_fam_sup: 'family_support',
  grp_talk_father: 'family_support',
  grp_talk_mother: 'family_support',
  emcsocmed8: 'digital_social',
};

export const supportResourceLibrary = {
  sleep: {
    label: 'Sleep',
    sourceLabel: 'MindSG — Sleeping Well (Teens)',
    tips: [
      {
        header: 'Why your body fights sleep at night',
        body: `Your brain actually releases the sleep hormone melatonin later at night during your teens — so feeling like a "night owl" isn't just laziness, it's biology. Aim for 8–10 hours and try to keep a consistent bedtime, even on weekends.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/sleeping-well-teens',
      },
      {
        header: 'The 20-minute rule',
        body: "If you've been lying awake for more than 20 minutes, don't force it. Get up, do something calm in another room (reading, music — no screens), then go back when you feel sleepy. Lying awake in bed teaches your brain to associate your bed with being awake.",
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/sleeping-well-teens',
      },
      {
        header: '"Revenge bedtime procrastination"',
        body: `Staying up late to get "me time" after a packed day is really common — it even has a name. But losing sleep to scroll or game means tomorrow feels harder. Try protecting 30 minutes before bed as your wind-down window, screens off.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/sleeping-well-teens',
      },
      {
        header: 'Sleep and your grades',
        body: 'Your brain consolidates what you learned during sleep — it\'s literally processing your lessons while you rest. Sleeping less than 8 hours before an exam hurts performance more than a last-minute study session helps it.',
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/sleeping-well-teens',
      },
    ],
  },
  school_stress: {
    label: 'School Stress',
    sourceLabel: 'MindSG — Coping with Stress (Teens)',
    tips: [
      {
        header: 'Not all stress is bad',
        body: `A small amount of stress ("eustress") actually helps you focus and perform. The problem is when it's constant and overwhelming. Notice what your body tells you — tension, nervous habits — as an early warning sign to slow down.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/coping-with-stress-teens',
      },
      {
        header: 'Break it down',
        body: 'When everything feels urgent, pick just one task and start there. Work in short focused bursts (try 25 minutes, then a 5-minute break). Finishing one small thing actually changes how the rest feels.',
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/coping-with-stress-teens',
      },
      {
        header: 'Mindfulness in 2 minutes',
        body: `You don't need to meditate for an hour. Just pause and notice: what are you feeling right now, without judging it? Practising this briefly — especially before a stressful class — can help you stay grounded rather than spiral.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/coping-with-stress-teens',
      },
      {
        header: 'Talk before it builds',
        body: `Stress compounds when kept inside. Telling a teacher, friend, or family member early — even just "I'm finding this week hard" — is often enough to feel less alone and start thinking more clearly.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/coping-with-stress-teens',
      },
    ],
  },
  bullying: {
    label: 'Bullying',
    sourceLabel: 'HealthHub / MindSG',
    tips: [
      {
        header: "You don't have to handle this alone",
        body: `Whether it's in school or online, bullying is not something you should deal with by yourself. Telling a trusted adult — a teacher, parent, or school counsellor — is not "snitching." It's taking control.`,
        link: 'https://parentingforwellness.hpb.gov.sg/Module-11/Topic-11A/Cyberbullying-and-ways-to-support-your-child-if-they-are-a-victim',
      },
      {
        header: "Don't react online",
        body: `Cyberbullies want a reaction — it's what keeps them going. Blocking, not responding, and saving evidence (screenshots with dates) puts you in control, not them. If it escalates, report it to a trusted adult or the platform.`,
        link: 'https://parentingforwellness.hpb.gov.sg/Module-11/Topic-11A/Cyberbullying-and-ways-to-support-your-child-if-they-are-a-victim',
      },
      {
        header: 'Your feelings are valid',
        body: `Being bullied can make you feel angry, embarrassed, or worthless — all of those feelings make sense. What's happening is not a reflection of your worth. Speaking to someone you trust about how you're feeling is a real step forward.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
    ],
  },
  social_peers: {
    label: 'Social & Peers',
    sourceLabel: 'MindSG / HealthHub',
    tips: [
      {
        header: 'Feeling left out is more common than you think',
        body: `The feeling of not fitting in hits almost everyone at some point, even when it looks like others have it figured out. Reaching out to even one person — a classmate, a CCA friend — often matters more than it seems in the moment.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
      {
        header: 'Being a good friend helps you too',
        body: `Supporting a classmate who's having a rough time — even just listening — builds connection for both of you. You don't need the perfect words, just a genuine "I noticed you seem off, you okay?"`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
      {
        header: 'Peer pressure is real — so is your right to say no',
        body: `Doing things just to fit in often leaves you feeling worse, not better. Knowing your own values and practising simple responses ("I'm not into that") gets easier with time and protects your self-respect.`,
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/mental-wellness/deal_with_peer_pressure_media',
      },
    ],
  },
  family_support: {
    label: 'Family Support',
    sourceLabel: 'MindSG — Seeking Support',
    tips: [
      {
        header: 'Starting the conversation',
        body: `It can feel awkward to talk to parents about how you're feeling, especially if you're not sure how they'll react. You don't have to have the full conversation at once. Even "I've been finding things a bit hard lately" opens a door.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
      {
        header: 'Family tension is normal in your teens',
        body: `As you seek independence, friction with parents is expected. It doesn't mean they don't care — it often means everyone's adjusting. Finding small shared moments (a meal, a walk) can rebuild connection without needing a big talk.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-others/my-family',
      },
      {
        header: 'You can also talk to another trusted adult',
        body: `If talking to parents feels impossible right now, a school counsellor, aunt, uncle, or another trusted adult can be just as valuable a source of support. Seeking help is not a sign that your family is broken — it's a sign you're taking care of yourself.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
    ],
  },
  physical: {
    label: 'Physical Wellbeing',
    sourceLabel: 'MindSG',
    tips: [
      {
        header: 'Your body and mind are connected',
        body: `Headaches, stomachaches, and fatigue are often how stress and difficult emotions show up physically in teens. If aches keep coming back without a clear cause, it's worth paying attention to how you're feeling emotionally too.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/understanding-depression-teens',
      },
      {
        header: 'Move a little, feel a little better',
        body: `Even a short walk releases endorphins — your body's natural mood boosters. You don't need a full workout. A 15-minute walk outside, especially in daylight, is one of the simplest things you can do for both your body and mood.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/preventing-self-harm-and-suicide-teens',
      },
      {
        header: "Don't push through everything",
        body: `Rest is not laziness. If your body is giving you signals — persistent tiredness, frequent aches — it might be asking you to slow down. Checking in with a school nurse or doctor is a completely reasonable and responsible thing to do.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/sleeping-well-teens',
      },
    ],
  },
  breakfast_habits: {
    label: 'Breakfast Habits',
    sourceLabel: 'HealthHub Singapore',
    tips: [
      {
        header: 'Breakfast helps your brain wake up too',
        body: `Breakfast is not just about “not being hungry” — it helps you start the school morning with steadier energy. Even a simple option like wholemeal bread, cereal with milk, or a sandwich can be a solid start.`,
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/food-diet-and-nutrition/eat_to_win_school_canteen',
      },
      {
        header: 'Skipping breakfast can affect mood and focus',
        body: 'When you go through the morning without eating, it can be harder to concentrate and easier to feel irritable or flat. A small breakfast is still better than none.',
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/food-diet-and-nutrition/eat_to_win_school_canteen',
      },
      {
        header: 'It does not need to be a big meal',
        body: 'If you are not very hungry in the morning, keep it simple: milk, fruit, eggs, or a small wholegrain option still counts. The goal is consistency, not perfection.',
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/food-diet-and-nutrition/look-what-i-brought-for-recess',
      },
    ],
  },
  body_image: {
    label: 'Body Image',
    sourceLabel: 'HealthHub Singapore — Self-Esteem & Body Image',
    tips: [
      {
        header: 'Feeling self-conscious during puberty is common',
        body: 'A lot of teens become more aware of how they look during puberty. That does not mean anything is “wrong” with you — it is a common part of this stage of life.',
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/child-and-teens-health/help-your-child-cope-with-puberty-and-self-esteem',
      },
      {
        header: "What you see isn't the full picture",
        body: `Social media and advertising constantly show edited, filtered images — not real ones. Comparing how you look to what you see online is comparing your reality to someone else's highlight reel. Your body is doing more for you than you probably give it credit for.`,
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/child-and-teens-health/nurturing-self-esteem',
      },
      {
        header: 'Self-esteem is built, not born',
        body: `Feeling good about yourself is a skill you can practise — it's not something you either have or don't. Noticing things you do well (not just how you look), spending time on things you enjoy, and being kind to yourself in hard moments all build it over time.`,
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/mental-wellness/boosting-your-self-esteem',
      },
      {
        header: 'Talk to someone you trust',
        body: `Feeling unhappy about how your body looks — especially when it's persistent — is worth talking about, not pushing through alone. A school counsellor, parent, or trusted adult can help you work through it without judgement.`,
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/child-and-teens-health/help-your-child-cope-with-puberty-and-self-esteem',
      },
    ],
  },
  digital_social: {
    label: 'Digital & Social Media',
    sourceLabel: 'MindSG',
    tips: [
      {
        header: 'Scrolling to feel better often backfires',
        body: `Using social media when you're upset can feel soothing in the moment, but it often makes you feel worse — especially when you're comparing yourself to others. Try a different 10-minute reset: music, a short walk, or texting a friend directly.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/coping-with-stress-teens',
      },
      {
        header: 'Blue light and your sleep',
        body: `Screens emit blue light that delays your brain's sleep hormone, making it harder to fall asleep even when you're tired. Try switching devices to night mode after 9pm, or doing a screen-free 30 minutes before bed.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/sleeping-well-teens',
      },
      {
        header: 'Your feed is a highlight reel',
        body: `Social media shows the best moments — rarely the hard ones. Comparing your ordinary day to someone else's best moment is always going to feel unfair. Noticing when a platform is making you feel worse about yourself is the first step to using it on your terms.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/caring-for-ourselves/understanding-depression-teens',
      },
    ],
  },
  teacher_support: {
    label: 'Your Teachers',
    sourceLabel: 'MindSG — Seeking Support',
    tips: [
      {
        header: 'Teachers are often the first door',
        body: `If you're struggling with something, your teacher can connect you to your school counsellor — you don't need to have everything figured out first. A simple "I've been having a tough time lately, could I talk to someone?" is enough to start.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
      {
        header: "It's okay to feel unsupported at school",
        body: `Feeling like your teachers don't notice you or care about how you're doing is a real and valid feeling. It doesn't mean support isn't available — your school counsellor is there specifically for situations like this, and you can approach them directly.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
      {
        header: 'Connection matters more than you think',
        body: `Research consistently shows that feeling supported by at least one adult at school makes a real difference to how you cope with pressure. If one teacher doesn't feel approachable, look for another — a CCA teacher, a form teacher, or any adult on campus you feel slightly more comfortable with.`,
        link: 'https://www.healthhub.sg/programmes/mindsg/seeking-support',
      },
    ],
  },
};

export function getSupportCategoryForFeature(featureId) {
  return supportCategoryByFeature[featureId] || null;
}

export function buildSupportCardsFromSignals(signals = [], historicalSignalSets = []) {
  const seenCategories = new Set();

  return signals
    .map((signal) => (typeof signal === 'string' ? { feature: signal } : signal))
    .map((signal) => {
      const feature = getFeatureById(signal.feature) || getFeatureByLabel(signal.factor);
      const featureId = feature?.feature || signal.feature;
      const category = getSupportCategoryForFeature(featureId);
      if (!featureId || !category || seenCategories.has(category)) return null;
      const library = supportResourceLibrary[category];
      if (!library) return null;
      seenCategories.add(category);
      const previousMatches = historicalSignalSets.filter((item) => item.includes(category)).length;
      const tip = library.tips[previousMatches % library.tips.length];

      return {
        featureId,
        featureLabel: formatSignalLabel(featureId),
        category,
        categoryLabel: library.label,
        title: tip.header,
        summary: tip.body,
        sourceLabel: library.sourceLabel,
        link: tip.link,
        severity: signal.severity || 'medium',
      };
    })
    .filter(Boolean)
    .slice(0, 2);
}
