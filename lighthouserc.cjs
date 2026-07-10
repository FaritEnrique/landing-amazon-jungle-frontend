module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "Local:",
      url: [
        "http://localhost:3000/en",
        "http://localhost:3000/es",
        "http://localhost:3000/en/faqs",
        "http://localhost:3000/es/preguntas-frecuentes"
      ],
      numberOfRuns: 1
    },
    upload: {
      target: "filesystem",
      outputDir: ".next/lighthouseci"
    }
  }
};
