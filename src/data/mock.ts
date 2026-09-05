import type { Category, Offer, Task, TimelineEvent, WorkerProfile } from "@/types/domain";

export const categories: Category[] = [
  { id: "repair", label: "Repair", icon: "AC", example: "Need AC repair today?" },
  { id: "tutoring", label: "Tutor", icon: "TU", example: "Class 9 physics tutor" },
  { id: "delivery", label: "Delivery", icon: "DE", example: "Pick up documents" },
  { id: "design", label: "Design", icon: "DS", example: "Social post design" },
  { id: "photo", label: "Photo", icon: "PH", example: "Birthday photography" },
  { id: "admin", label: "Admin", icon: "AD", example: "Data entry support" },
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

export const taskTimeline: TimelineEvent[] = [
  { label: "Posted", detail: "Task was published in Mirpur.", completed: true },
  { label: "Offer accepted", detail: "Rafiq was selected for the task.", completed: true },
  { label: "Hired", detail: "Contact instructions are available.", completed: true },
  { label: "In progress", detail: "Job seeker is expected to start today.", completed: true },
  { label: "Completion requested", detail: "Waiting for poster confirmation.", completed: false },
  { label: "Payment tracked", detail: "Manual payment note will appear here.", completed: false },
  { label: "Reviewed", detail: "Both sides can review after completion.", completed: false },
];
