import "dotenv/config";
import app from "./server.js";
const PORT = 3000;

if(!process.env.VERCEL){
  app.listen(PORT, ()=>{
      console.log(`Server running on port ${PORT}`);
  });
}