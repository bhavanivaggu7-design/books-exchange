/**
 * CampusBooks - Sample Textbook Dataset
 * Contains realistic engineering and college textbooks with full academic metadata,
 * condition ratings, pricing, and seller details.
 */

const INITIAL_BOOKS = [
  {
    id: "cb-101",
    title: "Database System Concepts",
    author: "Silberschatz, Korth & Sudarshan",
    edition: "7th Edition (International)",
    subject: "Database Management Systems (DBMS)",
    subjectKey: "dbms",
    condition: "Like New",
    price: 490,
    originalPrice: 1150,
    isbn: "978-9389588132",
    seller: {
      name: "Aarav Sharma",
      dept: "CSE, 3rd Year",
      campusLocation: "North Campus - Tech Block",
      verifiedStudent: true,
      joinDate: "Aug 2024",
      rating: 4.9
    },
    conditionDescription: "Carefully wrapped with clear plastic film. Zero pencil/pen marks, all pages crisp, includes original practice problem CD. Used only for one semester exam prep.",
    syllabusNote: "Prescribed textbook for 3rd semester CSE/IT DBMS coursework (covers Relational Algebra, SQL, Normalization & Transactions).",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80",
    coverColor: "#2e3b55",
    isFeatured: true,
    dateAdded: "2026-10-24"
  },
  {
    id: "cb-102",
    title: "Java: The Complete Reference",
    author: "Herbert Schildt",
    edition: "12th Edition (Oracle Press)",
    subject: "Java Programming",
    subjectKey: "java",
    condition: "Good",
    price: 420,
    originalPrice: 995,
    isbn: "978-1260463415",
    seller: {
      name: "Pooja Sundaram",
      dept: "Information Science, 4th Year",
      campusLocation: "Hostel Block 4 / Central Cafeteria",
      verifiedStudent: true,
      joinDate: "Jan 2024",
      rating: 4.8
    },
    conditionDescription: "Spine is intact and sturdy. Mild highlighter markings in Chapters 6 & 11 (Multithreading and Collections). No torn pages. Comes with sticky study tabs.",
    syllabusNote: "Comprehensive core reference for Object Oriented Programming in Java, Streams, Lambdas, and GUI components.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=700&q=80",
    coverColor: "#9c27b0",
    isFeatured: true,
    dateAdded: "2026-10-26"
  },
  {
    id: "cb-103",
    title: "Introduction to Algorithms (CLRS)",
    author: "Cormen, Leiserson, Rivest & Stein",
    edition: "4th Edition",
    subject: "Data Structures and Algorithms",
    subjectKey: "dsa",
    condition: "Like New",
    price: 650,
    originalPrice: 1800,
    isbn: "978-0262046305",
    seller: {
      name: "Rohan Varma",
      dept: "CSE, 2nd Year (M.Tech)",
      campusLocation: "Central Library Reading Hall",
      verifiedStudent: true,
      joinDate: "Jul 2024",
      rating: 5.0
    },
    conditionDescription: "Bought new 4 months ago for competitive programming and GATE prep. Hardcover edition in pristine condition, pages spotless and uncreased.",
    syllabusNote: "The gold standard textbook for DSA courses, dynamic programming, graph algorithms, and asymptotic complexity analysis.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
    coverColor: "#1a237e",
    isFeatured: true,
    dateAdded: "2026-10-22"
  },
  {
    id: "cb-104",
    title: "Operating System Concepts",
    author: "Silberschatz, Galvin & Gagne",
    edition: "10th Edition",
    subject: "Operating Systems",
    subjectKey: "os",
    condition: "Good",
    price: 380,
    originalPrice: 895,
    isbn: "978-1119800361",
    seller: {
      name: "Ananya Deshmukh",
      dept: "Computer Technology, 3rd Year",
      campusLocation: "Admin Building Quadrangle",
      verifiedStudent: true,
      joinDate: "Sep 2024",
      rating: 4.7
    },
    conditionDescription: "Iconic 'Dinosaur Book'. Firm binding with slight edge wear on front corner. Marginal pencil notes on Deadlock avoidance and Virtual Memory chapters.",
    syllabusNote: "Covers process scheduling, threads, synchronization, memory management, and Linux/Windows kernel case studies.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80",
    coverColor: "#00695c",
    isFeatured: false,
    dateAdded: "2026-10-21"
  },
  {
    id: "cb-105",
    title: "Computer Networking: A Top-Down Approach",
    author: "James F. Kurose & Keith W. Ross",
    edition: "8th Edition",
    subject: "Computer Networks",
    subjectKey: "networks",
    condition: "Like New",
    price: 520,
    originalPrice: 1250,
    isbn: "978-0136681557",
    seller: {
      name: "Vikramaditya Sen",
      dept: "ECE / Networking Lab",
      campusLocation: "Main Auditorium Lawn",
      verifiedStudent: true,
      joinDate: "Feb 2025",
      rating: 4.9
    },
    conditionDescription: "Mint condition. No stains, creases or annotations. Includes access code scratch card (unscratched) for supplementary Wireshark network trace lab exercises.",
    syllabusNote: "Top-down pedagogy starting from Application layer (HTTP, DNS) through Transport (TCP/UDP), Network (BGP/OSPF), and Data Link layers.",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80",
    coverColor: "#0d47a1",
    isFeatured: true,
    dateAdded: "2026-10-27"
  },
  {
    id: "cb-106",
    title: "Higher Engineering Mathematics",
    author: "Dr. B.S. Grewal",
    edition: "44th Edition",
    subject: "Engineering Mathematics",
    subjectKey: "math",
    condition: "Acceptable",
    price: 290,
    originalPrice: 850,
    isbn: "978-8193328491",
    seller: {
      name: "Karan Patel",
      dept: "Mechanical Engineering, 2nd Year",
      campusLocation: "Workshop Block / Student Canteen",
      verifiedStudent: true,
      joinDate: "Mar 2024",
      rating: 4.6
    },
    conditionDescription: "Well-loved and fully legible. Clear tape applied along the exterior spine for longevity. Some solved steps written in pencil in Differential Equations and Fourier Transforms.",
    syllabusNote: "The essential engineering math bible for Semesters 1 through 4 across all engineering disciplines in Indian technical universities.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80",
    coverColor: "#e65100",
    isFeatured: false,
    dateAdded: "2026-10-18"
  },
  {
    id: "cb-107",
    title: "Software Engineering: A Practitioner's Approach",
    author: "Roger S. Pressman & Bruce R. Maxim",
    edition: "9th Edition",
    subject: "Software Engineering",
    subjectKey: "software",
    condition: "Good",
    price: 360,
    originalPrice: 920,
    isbn: "978-1259872976",
    seller: {
      name: "Sneha Nair",
      dept: "CSE, Final Year",
      campusLocation: "Innovation & Incubation Hub",
      verifiedStudent: true,
      joinDate: "Nov 2023",
      rating: 5.0
    },
    conditionDescription: "Clean copy with minimal light yellow highlighter on Agile Scrum and Software Metrics sections. All binding pages firmly attached.",
    syllabusNote: "Covers Agile frameworks, DevOps lifecycles, UML modeling, architectural styles, software testing strategies, and quality assurance.",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
    coverColor: "#4527a0",
    isFeatured: false,
    dateAdded: "2026-10-25"
  },
  {
    id: "cb-108",
    title: "Digital Logic and Computer Design",
    author: "M. Morris Mano",
    edition: "Revised 1st Edition",
    subject: "Digital Logic and Computer Organization",
    subjectKey: "digital-logic",
    condition: "Good",
    price: 310,
    originalPrice: 775,
    isbn: "978-9332542525",
    seller: {
      name: "Devendra Rao",
      dept: "ECE, 3rd Year",
      campusLocation: "Semiconductor Lab / Ground Floor Corridor",
      verifiedStudent: true,
      joinDate: "Aug 2024",
      rating: 4.8
    },
    conditionDescription: "Clean text body. Minor neat underline marks on Karnaugh maps and Flip-Flop truth tables. Clean paper edges.",
    syllabusNote: "Foundation text for Boolean Algebra, Combinational/Sequential Circuits, Counters, Registers, and basic CPU architecture.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80",
    coverColor: "#004d40",
    isFeatured: true,
    dateAdded: "2026-10-20"
  },
  {
    id: "cb-109",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell & Peter Norvig",
    edition: "4th Edition (Global)",
    subject: "Computer Science Electives",
    subjectKey: "ai",
    condition: "Like New",
    price: 720,
    originalPrice: 1990,
    isbn: "978-0134610993",
    seller: {
      name: "Tanvi Kulkarni",
      dept: "AI & Data Science, 4th Year",
      campusLocation: "AI Research Center, 2nd Floor",
      verifiedStudent: true,
      joinDate: "Jan 2025",
      rating: 4.9
    },
    conditionDescription: "Hardly used, was bought for an elective project. Pristine spine, no creases, bookmarks or folds. As fresh as buying off the shelf.",
    syllabusNote: "Standard global AI curriculum reference covering Search Algorithms, Logic, Probabilistic Reasoning, Neural Networks, and Reinforcement Learning.",
    coverImage: "https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=700&q=80",
    coverColor: "#311b92",
    isFeatured: false,
    dateAdded: "2026-10-26"
  },
  {
    id: "cb-110",
    title: "Discrete Mathematics and Its Applications",
    author: "Kenneth H. Rosen",
    edition: "8th Edition",
    subject: "Engineering Mathematics",
    subjectKey: "math",
    condition: "Acceptable",
    price: 340,
    originalPrice: 950,
    isbn: "978-1260091991",
    seller: {
      name: "Harish Pillai",
      dept: "IT, 2nd Year",
      campusLocation: "Sports Complex & Gym Gate",
      verifiedStudent: true,
      joinDate: "May 2024",
      rating: 4.5
    },
    conditionDescription: "Slight curling on cover corners, thoroughly checked inside. All theorems, proof exercises, and recurrence relation solutions are intact and clear.",
    syllabusNote: "Fundamental for computer science theory: Set Theory, Graph Theory, Combinatorics, Relations, and Propositional Logic.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=80",
    coverColor: "#b71c1c",
    isFeatured: false,
    dateAdded: "2026-10-15"
  }
];

// Available Subject categories for filters and listing submission
const SUBJECT_CATEGORIES = [
  "Database Management Systems (DBMS)",
  "Java Programming",
  "Data Structures and Algorithms",
  "Operating Systems",
  "Computer Networks",
  "Engineering Mathematics",
  "Software Engineering",
  "Digital Logic and Computer Organization",
  "Computer Science Electives"
];

// Condition descriptions and badges
const CONDITION_META = {
  "Like New": {
    badgeClass: "badge-like-new",
    desc: "Looks almost unread. Crisp pages, no highlights or pen markings, strong spine."
  },
  "Good": {
    badgeClass: "badge-good",
    desc: "Lightly used with minimal highlights or notes. Sturdy binding and all pages clean."
  },
  "Acceptable": {
    badgeClass: "badge-acceptable",
    desc: "Visible signs of wear on cover or pages, minor notes, but 100% complete and legible."
  }
};
