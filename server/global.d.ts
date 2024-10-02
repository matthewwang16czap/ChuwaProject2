declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'; // Must be one of these values
      PORT?: string;                                   // Optional string variable (can be undefined)
      MONGODB_URI: string;                                  // Required string variable
      JWT_SECRET: string;                              // Required string variable
    }
  }