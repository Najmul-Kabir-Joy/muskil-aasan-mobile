import type {
  Category,
  CompletedJob,
  CompletedReferralJob,
  CurrentJobPost,
  EligibleReferral,
  JobResponse,
  JobWithResponses,
  MarketplaceProfile,
  Offer,
  ProfileSection,
  ProfileVisibility,
  SeekerFeedback,
  Task,
  TimelineEvent,
  WorkerProfile,
} from "@/types/domain";

export const categories: Category[] = [
  { id: "repair", label: "Repair", icon: "AC", example: "Need AC repair today?" },
  { id: "tutoring", label: "Tutor", icon: "TU", example: "Class 9 physics tutor" },
  { id: "delivery", label: "Delivery", icon: "DE", example: "Pick up documents" },
  { id: "design", label: "Design", icon: "DS", example: "Social post design" },
  { id: "photo", label: "Photo", icon: "PH", example: "Birthday photography" },
  { id: "admin", label: "Admin", icon: "AD", example: "Data entry support" },
  { id: "cleaning", label: "Cleaning", icon: "CL", example: "Deep clean before Eid" },
  { id: "moving", label: "Moving", icon: "MV", example: "Help shifting to a new flat" },
  { id: "electrician", label: "Electrician", icon: "EL", example: "Fix a tripping circuit" },
  { id: "plumbing", label: "Plumbing", icon: "PL", example: "Leaking kitchen tap" },
  { id: "carpentry", label: "Carpentry", icon: "CP", example: "Fix a wobbly almirah" },
  { id: "painting", label: "Painting", icon: "PT", example: "Paint one bedroom wall" },
  { id: "gardening", label: "Gardening", icon: "GD", example: "Trim a rooftop garden" },
  { id: "cooking", label: "Cooking", icon: "CK", example: "Cook for a small gathering" },
  { id: "babysitting", label: "Babysitting", icon: "BS", example: "Watch toddler for the evening" },
  { id: "elderlyCare", label: "Elderly Care", icon: "EC", example: "Companion for elderly parent" },
  { id: "petCare", label: "Pet Care", icon: "PC", example: "Walk the dog twice daily" },
  { id: "eventHelp", label: "Event Help", icon: "EH", example: "Extra hands for a birthday party" },
  { id: "driving", label: "Driving", icon: "DR", example: "Airport pickup and drop" },
  { id: "errands", label: "Errands", icon: "ER", example: "Grocery run this evening" },
  { id: "laundry", label: "Laundry", icon: "LN", example: "Wash and iron a week's clothes" },
  { id: "tailoring", label: "Tailoring", icon: "TL", example: "Alter a punjabi before Eid" },
  {
    id: "beautyGrooming",
    label: "Beauty & Grooming",
    icon: "BG",
    example: "Home haircut and trim",
  },
  {
    id: "fitnessTraining",
    label: "Fitness Training",
    icon: "FT",
    example: "Morning home workout session",
  },
  { id: "computerRepair", label: "Computer Repair", icon: "CR", example: "Laptop won't boot up" },
  { id: "mobileRepair", label: "Mobile Repair", icon: "MR", example: "Cracked phone screen fix" },
  {
    id: "pestControl",
    label: "Pest Control",
    icon: "PS",
    example: "Cockroach treatment for kitchen",
  },
  { id: "catering", label: "Catering", icon: "CT", example: "Snacks for an office meeting" },
  { id: "other", label: "Other", icon: "OT", example: "Something else? Just describe it." },
];

// The prototype's signed-in account — the same Nadia Rahman the Provider
// shell's drawer and Home greeting show. One account: this is her Seeker side
// (Seeker Rating, Can Help With); her Provider side lives in
// `currentUserProfileDetails` below.
export const CURRENT_USER_ID = "w7";

const currentUser: WorkerProfile = {
  id: CURRENT_USER_ID,
  name: "Nadia Rahman",
  rating: 4.9,
  ratingCount: 21,
  completedJobs: 24,
  area: "Mirpur",
  verification: "unverified",
  categories: ["Repair", "Tutor", "Delivery", "Design", "Photo"],
};

export const workers: WorkerProfile[] = [
  {
    id: "w1",
    name: "Rafiq Islam",
    rating: 4.8,
    ratingCount: 39,
    completedJobs: 42,
    area: "Mirpur",
    verification: "verified",
    categories: ["Repair", "Delivery"],
  },
  {
    id: "w2",
    name: "Nusrat Jahan",
    rating: 4.9,
    ratingCount: 28,
    completedJobs: 31,
    area: "Dhanmondi",
    verification: "verified",
    categories: ["Tutor", "Admin"],
  },
  {
    id: "w3",
    name: "Arman Hossain",
    rating: 4.7,
    ratingCount: 15,
    completedJobs: 18,
    area: "Banani",
    verification: "pending",
    categories: ["Design", "Photo"],
  },
  {
    id: "w4",
    name: "Kamal Hossain",
    rating: 4.6,
    ratingCount: 22,
    completedJobs: 25,
    area: "Mirpur",
    verification: "verified",
    categories: ["Repair", "Electrician"],
  },
  {
    id: "w5",
    name: "Shirin Akter",
    rating: 4.9,
    ratingCount: 51,
    completedJobs: 58,
    area: "Mirpur 10",
    verification: "verified",
    categories: ["Repair", "Electrician"],
  },
  {
    id: "w6",
    name: "Jasim Uddin",
    rating: 4.5,
    ratingCount: 12,
    completedJobs: 14,
    area: "Mirpur",
    verification: "pending",
    categories: ["Repair"],
  },
  currentUser,
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Need AC servicing today",
    category: "Repair",
    budget: "৳1,200",
    area: "Mirpur",
    timing: "Today",
    status: "offer received",
    urgent: true,
    offerCount: 4,
    description: "Split AC needs cleaning and cooling check before evening.",
    postedAgo: "today",
  },
  {
    id: "t2",
    title: "Class 9 physics tutor",
    category: "Tutor",
    budget: "৳6,000/mo",
    area: "Dhanmondi",
    timing: "Weekends",
    status: "open",
    urgent: false,
    offerCount: 7,
    description: "Need in-person help twice a week for NCTB physics.",
    postedAgo: "3 days ago",
  },
  {
    id: "t3",
    title: "Design social media posts",
    category: "Design",
    budget: "৳2,500",
    area: "Remote",
    timing: "2 days",
    status: "hired",
    urgent: false,
    offerCount: 11,
    description: "Create five Facebook post templates using existing brand colors.",
  },
];

export const offers: Offer[] = [
  {
    id: "o1",
    taskId: "t1",
    worker: workers[0],
    amount: "৳1,000",
    estimatedTime: "Today 5 PM",
    message: "I can service the unit today and check gas pressure if needed.",
    status: "submitted",
  },
  {
    id: "o2",
    taskId: "t1",
    worker: workers[2],
    amount: "৳1,300",
    estimatedTime: "Tomorrow morning",
    message: "Includes cleaning, drainage check, and cooling test.",
    status: "viewed",
  },
  {
    id: "o3",
    taskId: "t3",
    worker: workers[2],
    amount: "৳2,500",
    estimatedTime: "2 days",
    message: "I will share first draft within 24 hours and include one revision.",
    status: "accepted",
  },
];

// The current Provider's own most relevant open job — shared by
// ProviderHomeScreen's "Your Latest Job" card and the Responses feature's
// empty-state active-job preview, so both derive the same "which job is
// current" answer from one place rather than duplicating this pick.
export function getActiveJob(): Task | null {
  return tasks.find((task) => task.status !== "completed") ?? null;
}

// Completed MuSkill Aasan jobs between accounts in `workers`, oldest first —
// `getEligibleReferrals` relies on that order to pick each Seeker's most
// recent job. Each record backs both its Provider's Previous Job Posts and
// its Seeker's Previous Work & Feedback, and each Response's previous-work
// preview below is one of these, so no job is written down twice.
const groceryPickup: CompletedJob = {
  id: "cj1",
  title: "Grocery delivery & urgent pickup",
  area: "Mirpur 2",
  completedOn: "11 Aug",
  providerId: "w5",
  seekerId: CURRENT_USER_ID,
  providerRating: 5,
  seekerFeedback: {
    rating: 4,
    comment: "Delivery took a bit longer than expected due to rain, but items arrived safely.",
  },
  providerVisibility: "public",
  seekerVisibility: "hidden",
};

const kitchenShelfMounting: CompletedJob = {
  id: "cj2",
  title: "Kitchen shelf mounting",
  area: "Mirpur 10",
  completedOn: "14 Aug",
  providerId: CURRENT_USER_ID,
  seekerId: "w1",
  providerRating: 4,
  seekerFeedback: {
    rating: 4,
    comment: "All three shelves are level and sturdy. Took a little longer than planned.",
  },
  providerVisibility: "hidden",
  seekerVisibility: "public",
};

const logoDesign: CompletedJob = {
  id: "cj3",
  title: "Logo design for home bakery",
  area: "Remote",
  completedOn: "2 Sep",
  providerId: CURRENT_USER_ID,
  seekerId: "w3",
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Understood what the bakery needed and shared two strong options quickly.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const mathTutoring: CompletedJob = {
  id: "cj4",
  title: "Class 8 math tutoring",
  area: "Dhanmondi",
  completedOn: "8 Sep",
  providerId: "w3",
  seekerId: "w2",
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Explained concepts clearly and was very patient with my son.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const physicsCoaching: CompletedJob = {
  id: "cj5",
  title: "Physics & math coaching (Grade 8)",
  area: "Pallabi",
  completedOn: "18 Sep",
  providerId: "w6",
  seekerId: CURRENT_USER_ID,
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Great tutor! Helped my daughter understand geometry concepts easily.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const waterPumpInstallation: CompletedJob = {
  id: "cj6",
  title: "Water pump installation",
  area: "Dhanmondi",
  completedOn: "20 Sep",
  providerId: "w2",
  seekerId: "w4",
  providerRating: 4,
  seekerFeedback: {
    rating: 4,
    comment: "Solid work, arrived a little later than planned but finished the same day.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const pipeLeakFix: CompletedJob = {
  id: "cj7",
  title: "Emergency plumbing pipe leak fix",
  area: "Mirpur 10",
  completedOn: "28 Sep",
  providerId: CURRENT_USER_ID,
  seekerId: "w1",
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Came within the hour and stopped the leak before it reached the flat below.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const bathroomLightRepair: CompletedJob = {
  id: "cj8",
  title: "Bathroom light fixture repair",
  area: "Banani",
  completedOn: "30 Sep",
  providerId: "w3",
  seekerId: "w6",
  providerRating: 5,
  seekerFeedback: {
    rating: 4,
    comment: "Good work, would recommend for small electrical fixes.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const fanRegulatorFix: CompletedJob = {
  id: "cj9",
  title: "Ceiling fan regulator fix",
  area: "Mirpur 10",
  completedOn: "3 Oct",
  providerId: "w2",
  seekerId: CURRENT_USER_ID,
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Arrived on time and fixed everything properly. Very polite and thorough.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const exhaustFanFix: CompletedJob = {
  id: "cj10",
  title: "Kitchen exhaust fan fix",
  area: "Banani",
  completedOn: "5 Oct",
  providerId: "w3",
  seekerId: "w5",
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Very thorough, explained what was wrong before fixing it.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

const ceilingFanRepair: CompletedJob = {
  id: "cj11",
  title: "Ceiling fan repair",
  area: "Mirpur",
  completedOn: "12 Oct",
  providerId: CURRENT_USER_ID,
  seekerId: "w1",
  providerRating: 5,
  seekerFeedback: {
    rating: 5,
    comment: "Fixed it quickly and cleaned up after. Would call again.",
  },
  providerVisibility: "public",
  seekerVisibility: "public",
};

export const completedJobs: CompletedJob[] = [
  groceryPickup,
  kitchenShelfMounting,
  logoDesign,
  mathTutoring,
  physicsCoaching,
  waterPumpInstallation,
  pipeLeakFix,
  bathroomLightRepair,
  fanRegulatorFix,
  exhaustFanFix,
  ceilingFanRepair,
];

// The Seeker-side feedback of a completed job, in the shape a Response's
// previous-work preview uses.
function seekerFeedbackFrom(job: CompletedJob): SeekerFeedback {
  return { jobTitle: job.title, ...job.seekerFeedback };
}

// Job Seeker responses to the current Provider's own jobs (`tasks`),
// visible only to that job's owner — see docs/engineering/domain-and-
// terminology.md's Offer/Response distinction for why this isn't `Offer`.
export const jobResponses: JobResponse[] = [
  {
    id: "r1",
    taskId: "t1",
    worker: workers[0],
    message:
      "I can come this afternoon with my ladder and toolkit — I've serviced a few AC units in Mirpur before.",
    receivedAgo: "25m ago",
    previousWork: seekerFeedbackFrom(ceilingFanRepair),
  },
  {
    id: "r2",
    taskId: "t1",
    worker: workers[3],
    message:
      "I can check the gas pressure and clean the filter today evening if that works for you.",
    receivedAgo: "1h ago",
    previousWork: seekerFeedbackFrom(waterPumpInstallation),
  },
  {
    id: "r3",
    taskId: "t1",
    worker: workers[4],
    message:
      "Available now — I specialize in split AC servicing and can bring a spare filter just in case.",
    receivedAgo: "2h ago",
    previousWork: seekerFeedbackFrom(exhaustFanFix),
  },
  {
    id: "r4",
    taskId: "t1",
    worker: workers[5],
    message:
      "I can come by tomorrow morning with a full servicing kit if today doesn't work for you.",
    receivedAgo: "3h ago",
    previousWork: seekerFeedbackFrom(bathroomLightRepair),
  },
  {
    id: "r5",
    taskId: "t2",
    worker: workers[1],
    message:
      "I've taught NCTB physics for three years and can start this weekend. Happy to share a sample lesson plan first.",
    receivedAgo: "4h ago",
    previousWork: seekerFeedbackFrom(mathTutoring),
  },
];

// Derives which of the current Provider's jobs have received responses,
// and groups each job with its own responses — the Responses List's unit
// of grouping. Accepts an explicit list (rather than always reading
// `jobResponses`) so it stays testable against arbitrary data, matching
// `getEligibleReferrals`'s own pattern.
export function getJobsWithResponses(responses: JobResponse[] = jobResponses): JobWithResponses[] {
  const responsesByTaskId = new Map<string, JobResponse[]>();
  for (const response of responses) {
    const existing = responsesByTaskId.get(response.taskId);
    if (existing) {
      existing.push(response);
    } else {
      responsesByTaskId.set(response.taskId, [response]);
    }
  }

  return Array.from(responsesByTaskId, ([taskId, taskResponses]) => {
    const task = tasks.find((candidate) => candidate.id === taskId);
    return task ? [{ task, responses: taskResponses }] : [];
  }).flat();
}

// The one lookup the Response Detail route needs: a response plus the job
// it was made on, bundled together so a missing task can't leave the route
// with only half the data it needs.
export function getResponseWithJob(id: string): { task: Task; response: JobResponse } | undefined {
  const response = jobResponses.find((candidate) => candidate.id === id);
  if (!response) return undefined;
  const task = tasks.find((candidate) => candidate.id === response.taskId);
  if (!task) return undefined;
  return { task, response };
}

// Tasks posted by other neighbors, shown in the Provider Home "Community
// Jobs" feed — distinct from `tasks` (the current dummy user's own posts).
export const communityTasks: Task[] = [
  {
    id: "c1",
    title: "Pick up medicine from Labaid and deliver to Green Road",
    category: "Delivery",
    budget: "৳350",
    area: "Dhanmondi → Green Road",
    timing: "Need within 1 hour",
    status: "open",
    urgent: true,
    offerCount: 0,
    responseCount: 7,
    description:
      "Need someone with a bicycle/bike to quickly collect emergency prescription medicine from Labaid Hospital pharmacy and drop off at Green Road.",
    postedBy: { name: "Nusrat Jahan", area: "Dhanmondi" },
    postedAgo: "25 min ago",
    likes: 18,
  },
  {
    id: "c2",
    title: "Assemble wooden wardrobe & study desk",
    category: "Carpentry",
    budget: "৳1,200",
    area: "Mirpur 10",
    timing: "Tomorrow morning",
    status: "open",
    urgent: false,
    offerCount: 0,
    responseCount: 12,
    description:
      "Flat pack furniture delivered from Hatil. Need an experienced hand with power drill and basic carpentry tools.",
    postedBy: { name: "Tanvir Hossain", area: "Mirpur 10" },
    postedAgo: "1 hour ago",
    likes: 32,
    photoNote: "Hatil box & flatpack kit photo attached",
  },
  {
    id: "c3",
    title: "Bangla to English document transcription & typing",
    category: "Admin",
    budget: "৳600",
    area: "Remote / Anywhere in BD",
    timing: "Due Sunday",
    status: "open",
    urgent: false,
    offerCount: 0,
    responseCount: 4,
    description: "12 handwritten pages of university notes need neat typing into a Word document.",
    postedBy: { name: "Farzana Karim", area: "Gulshan 1" },
    postedAgo: "3 hours ago",
    likes: 9,
    remote: true,
  },
];

// The current Provider's (Nadia's) history of jobs completed with specific
// Job Seekers — this is the only source of Refer Someone eligibility. A
// worker with no entry here cannot be referred, regardless of their rating
// or categories. Derived from `completedJobs` (oldest first) so it can't
// drift from the Previous Job Posts on her profile. See
// `getEligibleReferrals` below and docs/engineering/domain-and-terminology.md.
export const completedReferralJobs: CompletedReferralJob[] = completedJobs
  .filter((job) => job.providerId === CURRENT_USER_ID)
  .map((job) => ({ workerId: job.seekerId, jobTitle: job.title }));

// Derives who the current Provider may refer from completedReferralJobs
// rather than hardcoding eligibility in a screen or component. A worker can
// appear in completedReferralJobs more than once (multiple completed jobs
// together); eligibility is per-worker, not per-job, so results are
// deduplicated by workerId, keeping the most recent job as the example —
// otherwise the same worker renders more than once wherever this list is
// keyed by worker id (e.g. ReferSomeoneSheet).
export function getEligibleReferrals(
  completedJobs: CompletedReferralJob[] = completedReferralJobs,
): EligibleReferral[] {
  const latestJobByWorkerId = new Map<string, string>();
  for (const completed of completedJobs) {
    latestJobByWorkerId.set(completed.workerId, completed.jobTitle);
  }

  return Array.from(latestJobByWorkerId, ([workerId, jobTitle]) => {
    const worker = workers.find((candidate) => candidate.id === workerId);
    return worker ? [{ worker, jobTitle }] : [];
  }).flat();
}

// The parts of a profile that don't already live on the person's
// `WorkerProfile` (name, area, Seeker Rating, Can Help With) or come from
// their jobs.
type ProfileDetails = Pick<
  MarketplaceProfile,
  "id" | "providerBio" | "seekerBio" | "providerRating" | "sectionVisibility"
>;

const ALL_SECTIONS_PUBLIC: Record<ProfileSection, ProfileVisibility> = {
  providerReputation: "public",
  previousJobPosts: "public",
  seekerReputation: "public",
  previousWork: "public",
};

const currentUserProfileDetails: ProfileDetails = {
  id: CURRENT_USER_ID,
  providerBio:
    "Always happy to help and connect with people nearby. Looking for reliable help for home projects.",
  seekerBio:
    "Electrical engineering undergrad & Mirpur neighbor. Happy to assist local families with home appliance troubleshooting, coaching, and errands.",
  providerRating: { rating: 4.7, ratingCount: 18 },
  sectionVisibility: ALL_SECTIONS_PUBLIC,
};

const profileDetails: ProfileDetails[] = [
  {
    id: "w1",
    providerBio: "Mirpur local. I post the odd job when a repair needs two people.",
    seekerBio:
      "Fixing fans, fittings and small household repairs around Mirpur. I bring my own tools.",
    providerRating: { rating: 0, ratingCount: 0 },
    sectionVisibility: ALL_SECTIONS_PUBLIC,
  },
  {
    id: "w2",
    providerBio: "Busy parent in Dhanmondi. I post errands and home jobs when I can't get to them.",
    seekerBio: "Tutor for classes 6–10, and happy to help with data entry and admin work.",
    providerRating: { rating: 4.5, ratingCount: 2 },
    sectionVisibility: ALL_SECTIONS_PUBLIC,
  },
  {
    id: "w3",
    providerBio: "I post the occasional home or tutoring job for my family.",
    seekerBio: "Freelance designer and photographer in Banani. Logos, social posts, event photos.",
    providerRating: { rating: 5, ratingCount: 3 },
    sectionVisibility: ALL_SECTIONS_PUBLIC,
  },
  {
    id: "w4",
    providerBio: "",
    seekerBio: "Electrician and pump fitter covering Mirpur and nearby areas.",
    providerRating: { rating: 0, ratingCount: 0 },
    sectionVisibility: ALL_SECTIONS_PUBLIC,
  },
  {
    id: "w5",
    providerBio: "I post small errands when work keeps me busy.",
    seekerBio: "Home electrical work and appliance repair in Mirpur 10.",
    providerRating: { rating: 5, ratingCount: 1 },
    sectionVisibility: ALL_SECTIONS_PUBLIC,
  },
  {
    id: "w6",
    providerBio: "Parent in Mirpur. I sometimes look for a tutor or a helping hand.",
    seekerBio: "Small repairs and fittings — reliable and on time.",
    providerRating: { rating: 5, ratingCount: 1 },
    sectionVisibility: ALL_SECTIONS_PUBLIC,
  },
  currentUserProfileDetails,
];

// Prototype mapping, not an approved lifecycle rule: a post is "current"
// while it's still collecting Responses. See
// docs/engineering/domain-and-terminology.md.
function isCurrentJobPost(task: Task) {
  return task.status === "open" || task.status === "offer received";
}

function newestFirst(jobs: CompletedJob[]) {
  return [...jobs].reverse();
}

function buildProfile(person: WorkerProfile, details: ProfileDetails): MarketplaceProfile {
  return {
    id: person.id,
    name: person.name,
    area: person.area,
    providerBio: details.providerBio,
    seekerBio: details.seekerBio,
    providerRating: details.providerRating,
    seekerRating: {
      rating: person.rating,
      ratingCount: person.ratingCount,
      completedJobs: person.completedJobs,
    },
    canHelpWith: person.categories,
    // `tasks` are the signed-in account's own posts; nobody else's job posts
    // are modelled yet, so other profiles have no current posts.
    currentJobPosts:
      person.id === CURRENT_USER_ID
        ? tasks.filter(isCurrentJobPost).map((task): CurrentJobPost => ({
            task,
            responseCount: jobResponses.filter((response) => response.taskId === task.id).length,
          }))
        : [],
    jobsAsProvider: newestFirst(completedJobs.filter((job) => job.providerId === person.id)),
    jobsAsSeeker: newestFirst(completedJobs.filter((job) => job.seekerId === person.id)),
    sectionVisibility: details.sectionVisibility,
  };
}

// The signed-in account's own profile — what the Profile tab shows.
export function getCurrentUserProfile(): MarketplaceProfile {
  return buildProfile(currentUser, currentUserProfileDetails);
}

// Anyone's profile by account id, for the Public Profile route. Undefined for
// an unknown id so the route can show a not-found state.
export function getMarketplaceProfile(id: string): MarketplaceProfile | undefined {
  const person = workers.find((candidate) => candidate.id === id);
  const details = profileDetails.find((candidate) => candidate.id === id);
  if (!person || !details) return undefined;
  return buildProfile(person, details);
}

export const taskTimeline: TimelineEvent[] = [
  { label: "Posted", detail: "Task was published in Mirpur.", completed: true },
  { label: "Offer accepted", detail: "Rafiq was selected for the task.", completed: true },
  { label: "Hired", detail: "Contact instructions are available.", completed: true },
  { label: "In progress", detail: "Job seeker is expected to start today.", completed: true },
  { label: "Completion requested", detail: "Waiting for poster confirmation.", completed: false },
  { label: "Payment tracked", detail: "Manual payment note will appear here.", completed: false },
  { label: "Reviewed", detail: "Both sides can review after completion.", completed: false },
];
