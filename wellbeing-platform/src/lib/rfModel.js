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
    question: 'Over the past 4 weeks, how would you describe your overall health?',
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
    question: 'Over the past 4 weeks, when you needed support, how supported have you felt by your family?',
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
    question: 'Over the past 4 weeks, if something was really bothering you, how easy would it be for you to talk to your father about it?',
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
    question: 'Over the past 4 weeks, if something was really bothering you, how easy would it be for you to talk to your mother about it?',
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
    question: 'Over the past 4 weeks, how accepted have you felt by other students?',
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
    question: 'Over the past 4 weeks, how have you felt about school?',
    sourceCols: ['likeschool'],
    aggregationMethod: 'raw',
    supportKey: 'school_belonging',
  },
  {
    feature: 'grp_bfast',
    label: 'Breakfast routine',
    category: 'habits',
    cadence: 'weekly',
    importance: 0.016366567575604694,
    question: 'Across school days and weekends, how regularly do you eat breakfast in a usual week?',
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
    cadence: 'weekly',
    importance: 0.016240873573690112,
    question: 'My teachers care about me and accept me as I am.',
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
    question: 'Over the past 4 weeks, how kind and helpful have your classmates been?',
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
    cadence: 'weekly',
    importance: 0.011223759015154275,
    question: 'My family is willing to help me make decisions.',
    sourceCols: ['famdec'],
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
    cadence: 'weekly',
    importance: 0.01022792520429548,
    question: 'Do you think your body is...?',
    sourceCols: ['thinkbody'],
    aggregationMethod: 'raw',
    supportKey: 'self_image',
  },
];

const selectedFeatureImportances = {
  grp_aches: 0.363368,
  sleepdificulty: 0.229028,
  health: 0.088985,
  schoolpressure: 0.075036,
  grp_fam_sup: 0.055058,
  grp_talk_father: 0.047937,
  emcsocmed8: 0.035994,
  studaccept: 0.020524,
  grp_been_bullied: 0.019712,
  grp_talk_mother: 0.019633,
  likeschool: 0.017041,
  sex: 0.015609,
  studhelpful: 0.012077,
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

export const MONITOR_THRESHOLD = 47.54;
export const FLAG_THRESHOLD = 58.07;
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
      key: 'tinkle_friend',
      label: 'Tinkle Friend (ages 7–18)',
      detail: 'Free helpline for children and teens in Singapore.',
      phone: '1800-274-4788',
      siteLabel: 'tinklefriend.sg',
      href: 'https://www.tinklefriend.sg',
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

function scoreToSeverityFromRisk(riskScore) {
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

function getSignalDirection(feature) {
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
  grp_been_bullied: 'bullying',
  studaccept: 'social_peers',
  studhelpful: 'social_peers',
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
        header: 'Sleep has been harder lately',
        body: "Your brain naturally releases melatonin later at night during your teen years, so feeling like a night owl isn't just laziness. Aim for 8–10 hours and try to keep a similar bedtime, even on weekends.",
        link: 'https://www.mindline.sg/youth/article/how-to-sleep-better?type=interest',
      },
      {
        header: 'Try the 20-minute reset',
        body: "If you've been awake for more than 20 minutes, get out of bed and do something calm without screens. Going back only when you feel sleepy helps your brain reconnect bed with rest.",
        link: 'https://www.mindline.sg/youth/article/how-to-sleep-better?type=interest',
      },
      {
        header: 'Protect your wind-down time',
        body: "Staying up late for 'me time' is really common after a packed day, but it often makes tomorrow feel harder. Try keeping the last 30 minutes before bed screen-free so your body can settle.",
        link: 'https://www.mindline.sg/youth/article/sleep-problems-in-teenagers-causes-and-myths?type=interest',
      },
      {
        header: 'Sleep helps with learning too',
        body: 'Your brain uses sleep to store what you learned during the day. Sleeping less than 8 hours before a big test usually hurts more than one last study sprint helps.',
        link: 'https://www.mindline.sg/youth/article/how-much-sleep-do-you-need?type=interest',
      },
    ],
  },
  school_stress: {
    label: 'School Stress',
    sourceLabel: 'MindSG — Coping with Stress (Teens)',
    tips: [
      {
        header: 'School may feel heavier this week',
        body: 'A little stress can help you focus, but constant stress feels different. If your body feels tense or restless, treat that as an early sign to pause and reset.',
        link: 'https://www.mindline.sg/youth/article/coping-with-stress?type=mood',
      },
      {
        header: 'Break the week into smaller pieces',
        body: 'When everything feels urgent, choose just one task and start there. A short 25-minute work block followed by a 5-minute break is often enough to get moving again.',
        link: 'https://www.mindline.sg/youth/article/coping-with-stress?type=mood',
      },
      {
        header: 'A short pause can help',
        body: 'You do not need a long meditation session to feel steadier. Even two minutes of noticing what you are feeling without judging it can help you slow the spiral.',
        link: 'https://www.mindline.sg/youth/article/coping-with-stress?type=mood',
      },
      {
        header: 'Say it early, not after it builds up',
        body: "Stress usually feels bigger when you keep it to yourself. Even saying 'this week has been a lot' to a teacher, friend, or family member can make the next step feel clearer.",
        link: 'https://www.mindline.sg/youth/article/coping-with-stress?type=mood',
      },
    ],
  },
  bullying: {
    label: 'Bullying',
    sourceLabel: 'HealthHub / MindSG',
    tips: [
      {
        header: "You don't have to handle this alone",
        body: "Whether it's in school or online, bullying is not something you should manage by yourself. Telling a trusted adult is not snitching — it's getting support.",
        link: 'https://www.mindline.sg/youth/article/getting-help-for-bullying?type=interest',
      },
      {
        header: "Don't give online bullying more fuel",
        body: 'Blocking, not replying, and saving screenshots can help you stay in control. If it keeps happening, report it to a trusted adult or the platform.',
        link: 'https://www.healthhub.sg/programmes/parent-hub/teens/screen-use',
      },
      {
        header: 'What happened is not your fault',
        body: 'Being bullied can leave you feeling angry, embarrassed, or worthless. Those feelings are real, but the bullying does not define your worth.',
        link: 'https://www.mindline.sg/youth/get-help',
      },
    ],
  },
  social_peers: {
    label: 'Social & Peers',
    sourceLabel: 'MindSG / HealthHub',
    tips: [
      {
        header: 'Feeling left out can hit hard',
        body: 'A lot of people feel out of place sometimes, even when it looks like others have it all together. Reaching out to even one classmate or friend can matter more than it seems.',
        link: 'https://www.mindline.sg/youth/article/understanding-friendship?type=interest',
      },
      {
        header: 'Connection does not need perfect words',
        body: "Checking in on someone else or sending a simple 'hey, are you okay?' can build connection for both of you. You do not need the perfect script to start.",
        link: 'https://www.mindline.sg/youth/article/how-to-talk-to-your-friend-about-mental-health?type=interest',
      },
      {
        header: 'You are allowed to say no',
        body: "Doing things just to fit in often leaves you feeling worse after. Short responses like 'I'm not into that' get easier with practice and protect your own boundaries.",
        link: 'https://www.healthhub.sg/well-being-and-lifestyle/mental-wellness/saying_no',
      },
    ],
  },
  family_support: {
    label: 'Family Support',
    sourceLabel: 'MindSG — Seeking Support',
    tips: [
      {
        header: 'Start small if talking feels awkward',
        body: "You do not need to explain everything at once. Even saying 'I've been finding things a bit hard lately' can be enough to open the door.",
        link: 'https://www.mindline.sg/youth/get-help',
      },
      {
        header: 'Tension at home does not always mean disconnection',
        body: "Wanting more independence can create friction with parents, and that is common in your teen years. Small shared moments like a meal or short walk can still rebuild connection.",
        link: 'https://www.mindline.sg/youth/article/caregiving-as-a-youth-a-guide-to-helping-others-and-yourself?type=interest',
      },
      {
        header: 'Another trusted adult counts too',
        body: 'If talking to a parent feels impossible right now, another adult you trust can still help. Reaching out is a sign that you are taking care of yourself, not that something is wrong with you.',
        link: 'https://www.mindline.sg/youth/article/how-and-where-to-get-help-for-mental-health-conditions?type=interest',
      },
    ],
  },
  physical: {
    label: 'Physical Wellbeing',
    sourceLabel: 'MindSG',
    tips: [
      {
        header: 'Your body can feel it too',
        body: 'Headaches, stomachaches, and tiredness can sometimes show up when a lot has been going on. If those aches keep coming back, it can help to notice both what is happening in your body and what has been on your mind.',
        link: 'https://www.mindline.sg/youth/article/coping-with-depression?type=interest',
      },
      {
        header: 'A short walk still counts',
        body: "Even a 15-minute walk can help your body loosen up and improve your mood a little. You do not need a full workout for movement to make a difference.",
        link: 'https://www.mindline.sg/youth/article/coping-with-depression?type=interest',
      },
      {
        header: "Resting is not 'being lazy'",
        body: 'If you are feeling run down or getting aches often, your body may be asking for a reset. It is completely okay to slow down and check in with an adult or doctor if it keeps happening.',
        link: 'https://www.mindline.sg/youth/article/how-much-sleep-do-you-need?type=interest',
      },
    ],
  },
  digital_social: {
    label: 'Digital & Social Media',
    sourceLabel: 'MindSG',
    tips: [
      {
        header: 'Scrolling for comfort can backfire',
        body: 'Social media can feel soothing when you are upset, but it can also pull you deeper into comparison or overthinking. Try a different 10-minute reset like music, a short walk, or messaging one friend directly.',
        link: 'https://www.mindline.sg/youth/article/coping-with-stress?type=mood',
      },
      {
        header: 'Screens can delay sleep',
        body: "Blue light from screens can delay your brain's sleep signal even when you feel tired. A screen-free 30 minutes before bed can make falling asleep easier.",
        link: 'https://www.mindline.sg/youth/article/how-to-sleep-better?type=interest',
      },
      {
        header: 'Your feed is not real life',
        body: "Most feeds are highlight reels, not the full picture. If a platform keeps making you feel worse about yourself, that is a sign to step back and use it more on your terms.",
        link: 'https://www.mindline.sg/youth/article/coping-with-depression?type=interest',
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
