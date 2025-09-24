const allowedOrigins = [
  "http://localhost:3000",
  "https://mouthful-trove.vercel.app",
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  optionsSuccessStatus: 200,
};
