/**
 * Domain model for a processed video workspace.
 *
 * Everything the product surfaces — slides, report, flashcards, quiz,
 * transcript — is derived from this single shape, mirroring the real
 * pipeline: one structured understanding of the video powers every
 * downstream artifact. Swapping `mockWorkspace` for a real API response
 * should not require touching the UI layer.
 */

export type ProcessingStage =
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "structuring"
  | "done";

export interface Chapter {
  id: string;
  timestamp: string;
  seconds: number;
  title: string;
  summary: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
}

export interface TranscriptLine {
  time: string;
  seconds: number;
  text: string;
}

/** One slide in the AI-generated presentation. Always anchored to a chapter. */
export interface Slide {
  id: string;
  index: number;
  chapterId: string;
  chapterLabel: string;
  title: string;
  bullets: string[];
  keyTakeaway: string;
  quote?: string;
  /** Search query describing the illustration this slide would carry. */
  imageQuery: string;
}

export interface ReportConcept {
  id: string;
  term: string;
  explanation: string;
  example: string;
}

export interface ReportQuote {
  id: string;
  quote: string;
  context: string;
}

/** The professional, long-form learning document — distinct from the summary. */
export interface Report {
  executiveSummary: string;
  learningObjectives: string[];
  chapterBreakdown: { chapterId: string; narrative: string }[];
  concepts: ReportConcept[];
  realWorldApplications: string[];
  quotes: ReportQuote[];
  keyInsights: string[];
  actionableTakeaways: string[];
  conclusion: string;
}

/** Lightweight placeholder shape — enough to render an honest "coming soon" UI. */
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  kind: "topic" | "concept";
  relatedTo: string[];
}

export interface StudyNoteDefinition {
  term: string;
  definition: string;
}

export interface StudyNoteExample {
  title: string;
  body: string;
}

/** Teacher-written study notes — the "premium notebook" view. */
export interface StudyNotes {
  learningObjectives: string[];
  keyConcepts: { heading: string; body: string }[];
  definitions: StudyNoteDefinition[];
  importantFacts: string[];
  examples: StudyNoteExample[];
  revisionNotes: string[];
  examTips: string[];
  finalSummary: string;
}

export interface VideoWorkspace {
  id: string;
  createdAt: string;
  title: string;
  source: string;
  duration: string;
  thumbnail: string;
  summary: string;
  keyTakeaways: string[];
  learningObjectives: string[];
  chapters: Chapter[];
  slides: Slide[];
  report: Report;
  studyNotes: StudyNotes;
  flashcards: FlashCard[];
  quiz: QuizQuestion[];
  transcript: TranscriptLine[];
  knowledgeGraph: KnowledgeGraphNode[];
}

export const emptyStudyNotes: StudyNotes = {
  learningObjectives: [],
  keyConcepts: [],
  definitions: [],
  importantFacts: [],
  examples: [],
  revisionNotes: [],
  examTips: [],
  finalSummary: "",
};

export const emptyReport: Report = {
  executiveSummary: "",
  learningObjectives: [],
  chapterBreakdown: [],
  concepts: [],
  realWorldApplications: [],
  quotes: [],
  keyInsights: [],
  actionableTakeaways: [],
  conclusion: "",
};

export const emptyWorkspace: VideoWorkspace = {
  id: "",
  createdAt: "",
  title: "",
  source: "",
  duration: "",
  thumbnail: "",
  summary: "",
  keyTakeaways: [],
  learningObjectives: [],
  chapters: [],
  slides: [],
  report: emptyReport,
  studyNotes: emptyStudyNotes,
  flashcards: [],
  quiz: [],
  transcript: [],
  knowledgeGraph: [],
};

export const demoWorkspace: VideoWorkspace = {
  id: "ws_demo",
  createdAt: new Date("2024-12-01").toISOString(),
  title: "The Mathematics of Neural Networks, Explained Visually",
  source: "youtube.com/watch?v=demo",
  duration: "18:42",
  thumbnail:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  summary:
    "A visual walkthrough of how neural networks learn — covering weighted sums, activation functions, backpropagation, and gradient descent — building intuition from a single neuron up to a full trainable network.",
  keyTakeaways: [
    "A neuron is just a weighted sum passed through a non-linear activation function.",
    "Backpropagation is the chain rule applied layer by layer to assign blame for the error.",
    "Gradient descent nudges every weight a small step opposite its gradient, repeatedly.",
    "Depth lets networks compose simple features into increasingly abstract ones.",
  ],
  learningObjectives: [
    "Explain what a single artificial neuron computes and why.",
    "Describe how stacking layers builds increasingly abstract representations.",
    "State the role of a loss function in measuring model error.",
    "Walk through backpropagation as an application of the chain rule.",
    "Connect gradient descent to how a network's weights actually update.",
  ],
  chapters: [
    { id: "c1", timestamp: "0:00", seconds: 0, title: "Why neural networks, intuitively", summary: "Framing the problem: learning a function from examples rather than writing rules by hand." },
    { id: "c2", timestamp: "2:14", seconds: 134, title: "The single neuron", summary: "Inputs, weights, bias, and the activation function that introduces non-linearity." },
    { id: "c3", timestamp: "5:40", seconds: 340, title: "Stacking layers", summary: "How layers of neurons compose simple signals into complex representations." },
    { id: "c4", timestamp: "9:05", seconds: 545, title: "Measuring error", summary: "Loss functions: turning 'wrong' into a single number you can optimize against." },
    { id: "c5", timestamp: "12:30", seconds: 750, title: "Backpropagation", summary: "Using the chain rule to push the error signal backward through every layer." },
    { id: "c6", timestamp: "16:02", seconds: 962, title: "Gradient descent in practice", summary: "Learning rate, batches, and why training looks like a slow walk downhill." },
  ],
  slides: [
    {
      id: "s1",
      index: 1,
      chapterId: "c1",
      chapterLabel: "Chapter 1 — Why neural networks, intuitively",
      title: "Learning a function, not writing one",
      bullets: [
        "Traditional software encodes rules by hand, one if-statement at a time.",
        "Neural networks instead learn a function directly from labeled examples.",
        "The 'learning' is just adjusting numbers until predictions match reality.",
        "This shift — from rules to examples — is the core idea of the whole field.",
      ],
      keyTakeaway: "Neural networks replace hand-written rules with patterns learned from data.",
      imageQuery: "rules versus learned patterns diagram",
    },
    {
      id: "s2",
      index: 2,
      chapterId: "c2",
      chapterLabel: "Chapter 2 — The single neuron",
      title: "Inside one artificial neuron",
      bullets: [
        "Each input is multiplied by a learned weight.",
        "Weighted inputs are summed together with a bias term.",
        "The sum passes through a non-linear activation function.",
        "That non-linearity is what makes the network more than plain algebra.",
      ],
      keyTakeaway: "A neuron is a weighted sum plus bias, passed through a non-linear activation.",
      quote: "Give a neuron enough weights, and it will tell you what it noticed.",
      imageQuery: "artificial neuron weights diagram",
    },
    {
      id: "s3",
      index: 3,
      chapterId: "c3",
      chapterLabel: "Chapter 3 — Stacking layers",
      title: "Depth turns features into concepts",
      bullets: [
        "Early layers tend to detect simple, low-level patterns.",
        "Later layers combine those patterns into more abstract features.",
        "Stacking is what lets a network represent complex relationships.",
        "More depth means more capacity — and more to train carefully.",
      ],
      keyTakeaway: "Depth lets networks build abstract ideas out of simple, composable parts.",
      imageQuery: "layered neural network feature hierarchy",
    },
    {
      id: "s4",
      index: 4,
      chapterId: "c4",
      chapterLabel: "Chapter 4 — Measuring error",
      title: "Turning 'wrong' into a number",
      bullets: [
        "A loss function compares the network's prediction to the true answer.",
        "It collapses that comparison into a single number to minimize.",
        "Different tasks call for different loss functions.",
        "Without a loss function, there is nothing for the network to optimize.",
      ],
      keyTakeaway: "Loss functions give training a single, optimizable target.",
      imageQuery: "loss function curve illustration",
    },
    {
      id: "s5",
      index: 5,
      chapterId: "c5",
      chapterLabel: "Chapter 5 — Backpropagation",
      title: "Assigning blame, layer by layer",
      bullets: [
        "Backpropagation applies the chain rule from calculus, repeatedly.",
        "It pushes the error signal backward, one layer at a time.",
        "Each weight receives a gradient describing how it contributed to the error.",
        "This is what makes training deep networks computationally feasible.",
      ],
      keyTakeaway: "Backpropagation efficiently computes how much each weight contributed to the error.",
      quote: "Every weight gets exactly the blame it deserves — no more, no less.",
      imageQuery: "backpropagation gradient flow diagram",
    },
    {
      id: "s6",
      index: 6,
      chapterId: "c6",
      chapterLabel: "Chapter 6 — Gradient descent in practice",
      title: "A slow, deliberate walk downhill",
      bullets: [
        "Gradient descent nudges every weight opposite its gradient.",
        "The learning rate controls how large each step is.",
        "Training happens in batches, repeated over many epochs.",
        "Progress looks less like a leap and more like a careful descent.",
      ],
      keyTakeaway: "Training is thousands of small, repeated steps — not one big insight.",
      imageQuery: "gradient descent loss landscape",
    },
  ],
  report: {
    executiveSummary:
      "This video builds, from first principles, an intuitive and mathematically grounded understanding of how neural networks learn. It begins with a single neuron and ends with a working picture of how gradient descent and backpropagation combine to train deep networks. The explanation favors visual reasoning over notation, making it accessible without sacrificing rigor.",
    learningObjectives: [
      "Explain what a single artificial neuron computes and why.",
      "Describe how stacking layers builds increasingly abstract representations.",
      "State the role of a loss function in measuring model error.",
      "Walk through backpropagation as an application of the chain rule.",
      "Connect gradient descent to how a network's weights actually update.",
    ],
    chapterBreakdown: [
      { chapterId: "c1", narrative: "The video opens by reframing the central problem software has always faced: encoding behavior. Rather than writing explicit rules, neural networks are introduced as systems that learn a function directly from labeled examples — a shift in approach, not just technique." },
      { chapterId: "c2", narrative: "Attention narrows to a single neuron. Each input is scaled by a learned weight, summed with a bias, and passed through a non-linear activation function. This non-linearity is highlighted as the essential ingredient that separates a neural network from simple linear algebra." },
      { chapterId: "c3", narrative: "The discussion scales from one neuron to many, arranged in layers. Early layers tend to respond to simple, low-level signals; later layers recombine those signals into increasingly abstract features. Depth is framed as compositional power, not just additional computation." },
      { chapterId: "c4", narrative: "Before a network can improve, it needs a way to measure how wrong it is. Loss functions are introduced as the mechanism that converts a prediction's error into a single number — the quantity that training will try to minimize." },
      { chapterId: "c5", narrative: "Backpropagation is presented as a direct, repeated application of the chain rule: the error signal is pushed backward through the network, layer by layer, so that every weight receives a precise gradient describing its contribution to the final error." },
      { chapterId: "c6", narrative: "Finally, gradient descent is shown in practice — each weight nudged a small step opposite its gradient, repeated across batches and epochs. The video closes by reframing training not as a single insight, but as a long, deliberate walk downhill." },
    ],
    concepts: [
      { id: "k1", term: "Weighted sum", explanation: "The combination of a neuron's inputs, each multiplied by a learned weight and added together with a bias term.", example: "Three inputs of 0.5, 1.2, and -0.3 with weights 0.4, 0.1, and 0.9 combine into a single number before the activation function is applied." },
      { id: "k2", term: "Activation function", explanation: "A non-linear function applied to a neuron's weighted sum, allowing the network to represent more than linear relationships.", example: "ReLU outputs zero for any negative input and passes positive inputs through unchanged." },
      { id: "k3", term: "Loss function", explanation: "A function that scores how far a prediction is from the true answer, producing the single value training tries to minimize.", example: "Mean squared error penalizes large mistakes more heavily than small ones." },
      { id: "k4", term: "Backpropagation", explanation: "An algorithm that uses the chain rule to compute how much each weight in the network contributed to the total error.", example: "An error at the output layer is propagated backward, layer by layer, until every weight has a gradient." },
      { id: "k5", term: "Gradient descent", explanation: "An optimization method that repeatedly updates each weight a small step in the direction that reduces the loss.", example: "A learning rate of 0.01 means each update moves a weight by 1% of its computed gradient." },
    ],
    realWorldApplications: [
      "Image recognition systems use stacked layers to move from raw pixels to recognizable objects.",
      "Recommendation engines learn weighted relationships between users and items the same way a neuron weighs its inputs.",
      "Speech-to-text systems rely on the same backpropagation and gradient descent loop to improve over millions of examples.",
      "Any system trained on labeled examples — fraud detection, medical imaging triage, translation — uses this same core training loop.",
    ],
    quotes: [
      { id: "q1", quote: "Give a neuron enough weights, and it will tell you what it noticed.", context: "On what a single neuron's learned weights represent." },
      { id: "q2", quote: "Every weight gets exactly the blame it deserves — no more, no less.", context: "On the precision of backpropagation's gradient computation." },
    ],
    keyInsights: [
      "Non-linearity, not size, is what gives networks their expressive power.",
      "Depth is best understood as composition: simple features building complex ones.",
      "Training is a search problem — gradient descent is just a disciplined way to search.",
      "Backpropagation is 'just' the chain rule, applied at a scale calculus alone wouldn't make tractable by hand.",
    ],
    actionableTakeaways: [
      "Before tuning a model, make sure you can explain what your loss function is actually penalizing.",
      "When a network underperforms, check non-linearity and depth before assuming more data is needed.",
      "Treat the learning rate as a deliberate dial, not a default — both too high and too low values stall learning.",
    ],
    conclusion:
      "By the end, the video has assembled a complete mental model of training: a neuron's weighted sum, a stack of layers that builds abstraction, a loss function that defines 'wrong,' backpropagation that assigns blame, and gradient descent that acts on it. Each idea is simple in isolation; together, they explain how a network goes from random weights to genuine competence.",
  },
  flashcards: [
    { id: "f1", front: "What does a single artificial neuron compute?", back: "A weighted sum of its inputs plus a bias, passed through a non-linear activation function." },
    { id: "f2", front: "What problem does backpropagation solve?", back: "Efficiently computing how much each weight in the network contributed to the final error, using the chain rule." },
    { id: "f3", front: "Why do we need a non-linear activation function?", back: "Without one, stacking layers would still only produce linear functions, no matter how deep the network." },
    { id: "f4", front: "What is the learning rate?", back: "A scalar that controls how large a step gradient descent takes when updating each weight." },
    { id: "f5", front: "What is a loss function?", back: "A single number measuring how wrong the network's prediction was, which training tries to minimize." },
  ],
  quiz: [
    {
      id: "q1",
      question: "What is the primary role of an activation function?",
      options: [
        "To normalize the input data",
        "To introduce non-linearity into the network",
        "To initialize the weights",
        "To reduce the number of layers",
      ],
      correctIndex: 1,
    },
    {
      id: "q2",
      question: "Backpropagation is a direct application of which mathematical rule?",
      options: ["Product rule", "Chain rule", "Quotient rule", "Power rule"],
      correctIndex: 1,
    },
    {
      id: "q3",
      question: "What does the learning rate control?",
      options: [
        "The number of training examples used",
        "The depth of the network",
        "The size of each weight update step",
        "The choice of loss function",
      ],
      correctIndex: 2,
    },
  ],
  transcript: [
    { time: "0:00", seconds: 0, text: "Most of what a neural network does can be traced back to a single, surprisingly simple idea." },
    { time: "0:18", seconds: 18, text: "Instead of writing rules by hand, we let the network learn a function from examples." },
    { time: "2:14", seconds: 134, text: "Let's zoom into just one neuron. It takes a few numbers in, multiplies each by a weight, and adds them up." },
    { time: "5:40", seconds: 340, text: "Now imagine thousands of these neurons, arranged in layers, each one feeding the next." },
    { time: "9:05", seconds: 545, text: "To know if the network is improving, we need a way to measure how wrong its guesses are." },
    { time: "12:30", seconds: 750, text: "This is where backpropagation comes in — it pushes that error signal backward, layer by layer." },
  ],
  knowledgeGraph: [
    { id: "n1", label: "Neuron", kind: "concept", relatedTo: ["n2", "n3"] },
    { id: "n2", label: "Activation function", kind: "concept", relatedTo: ["n1"] },
    { id: "n3", label: "Layer composition", kind: "topic", relatedTo: ["n1", "n4"] },
    { id: "n4", label: "Loss function", kind: "concept", relatedTo: ["n5"] },
    { id: "n5", label: "Backpropagation", kind: "topic", relatedTo: ["n4", "n6"] },
    { id: "n6", label: "Gradient descent", kind: "topic", relatedTo: ["n5"] },
  ],
  studyNotes: {
    learningObjectives: [
      "Explain the role of weights, biases, and activation functions inside a neuron.",
      "Describe how depth lets a network compose simple features into abstract ones.",
      "Define a loss function and explain why it is required for training.",
      "Walk through backpropagation as the chain rule applied layer by layer.",
      "Use gradient descent vocabulary — learning rate, batches, epochs — correctly.",
    ],
    keyConcepts: [
      { heading: "From rules to examples", body: "Neural networks replace hand-written rules with patterns learned from labelled examples. The 'learning' is really a slow, repeated adjustment of internal numbers." },
      { heading: "The single neuron", body: "Each neuron computes a weighted sum of its inputs, adds a bias, and passes the result through a non-linear activation function. Non-linearity is what gives the network real expressive power." },
      { heading: "Depth as composition", body: "Stacking layers lets early features (edges, simple correlations) be recombined into more abstract ones (shapes, motifs, eventually concepts)." },
      { heading: "Loss and gradients", body: "A loss function turns 'wrong' into a single number. Gradients describe how each weight should change to reduce that number." },
      { heading: "Backpropagation", body: "Backpropagation is the chain rule of calculus applied layer by layer — it efficiently assigns blame to every weight in the network." },
    ],
    definitions: [
      { term: "Weight", definition: "A learned number that scales an input as it enters a neuron." },
      { term: "Bias", definition: "A learned number added to a neuron's weighted sum before the activation function." },
      { term: "Activation function", definition: "A non-linear function (e.g. ReLU, sigmoid) applied to a neuron's output to give the network expressive power." },
      { term: "Loss function", definition: "A scalar measure of how far a prediction is from the true answer." },
      { term: "Gradient", definition: "The vector of partial derivatives of the loss with respect to each weight." },
      { term: "Learning rate", definition: "A scalar that controls the step size of each weight update during gradient descent." },
    ],
    importantFacts: [
      "Without non-linear activations, a deep network collapses into a single linear function.",
      "Backpropagation is mathematically identical to repeated application of the chain rule.",
      "The learning rate must be tuned: too high and training diverges, too low and it stalls.",
      "Training is done in batches across many epochs, not in a single sweep over the data.",
    ],
    examples: [
      { title: "Recognising handwritten digits", body: "Early layers detect strokes and edges; later layers combine them into loops and lines that identify each digit." },
      { title: "Predicting house prices", body: "Inputs like square footage and location are weighted and summed; the loss measures how far each predicted price is from the truth." },
    ],
    revisionNotes: [
      "A neuron = weighted sum + bias → activation.",
      "Network output is just many neurons composed in layers.",
      "Loss is one number; gradient is one number per weight.",
      "Backprop pushes error backward; gradient descent moves the weights.",
      "Tune learning rate before assuming you need more data.",
    ],
    examTips: [
      "If asked 'why non-linearity?' — say: without it, depth adds no expressive power.",
      "If asked 'what does backpropagation compute?' — say: the gradient of the loss with respect to each weight.",
      "Be precise about loss vs. accuracy — loss is the optimisation target, accuracy is the human-friendly score.",
      "Always mention learning rate when describing gradient descent.",
    ],
    finalSummary:
      "Neural networks learn by repeating a simple loop: forward-pass a prediction, measure how wrong it is, push the error backward through the chain rule, and nudge every weight a small step opposite its gradient. Non-linearity gives the network expressive power, depth lets it build abstractions, and the learning rate decides how cautiously it descends.",
  },
};

