import { Config } from "types/Supabase.types";
import env from "dotenv";

const path = ".env";
env.config({ path });


const config: Config = {
	apiKey: process.env.SUPABASE_API_KEY,
	endpoint: process.env.SUPABASE_ENDPOINT,
};

export default config;
