import type {
  Category,
  CompletedReferralJob,
  EligibleReferral,
  Offer,
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

export const workers: WorkerProfile[] = [
  {
    id: "w1",
    name: "Rafiq Islam",
    rating: 4.8,
    completedJobs: 42,
    area: "Mirpur",
    verification: "verified",
    categories: ["Repair", "Delivery"],
  },
  {
    id: "w2",
    name: "Nusrat Jahan",
    rating: 4.9,
    completedJobs: 31,
    area: "Dhanmondi",
    verification: "verified",
    categories: ["Tutor", "Admin"],
  },
  {
    id: "w3",
    name: "Arman Hossain",
    rating: 4.7,
    completedJobs: 18,
    area: "Banani",
    verification: "pending",
    categories: ["Design", "Photo"],
  },
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
// or categories. See `getEligibleReferrals` below and
// docs/engineering/domain-and-terminology.md.
export const completedReferralJobs: CompletedReferralJob[] = [
  { workerId: "w1", jobTitle: "Ceiling fan repair" },
  { workerId: "w3", jobTitle: "Logo design for home bakery" },
];

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

export const taskTimeline: TimelineEvent[] = [
  { label: "Posted", detail: "Task was published in Mirpur.", completed: true },
  { label: "Offer accepted", detail: "Rafiq was selected for the task.", completed: true },
  { label: "Hired", detail: "Contact instructions are available.", completed: true },
  { label: "In progress", detail: "Job seeker is expected to start today.", completed: true },
  { label: "Completion requested", detail: "Waiting for poster confirmation.", completed: false },
  { label: "Payment tracked", detail: "Manual payment note will appear here.", completed: false },
  { label: "Reviewed", detail: "Both sides can review after completion.", completed: false },
];
