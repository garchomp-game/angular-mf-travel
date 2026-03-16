// This file is a placeholder -- it gets overwritten by esbuild during Vercel's buildCommand.
// See vercel.json buildCommand and server/vercel-handler.ts for details.
module.exports = (req, res) => {
  res.status(500).json({ error: 'Build step did not run - this placeholder should have been replaced by esbuild' });
};
