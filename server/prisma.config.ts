// prisma.config.ts
import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  // earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: "postgresql://neondb_owner:npg_dgKCZSi72TzD@ep-summer-hill-aqb2q7kh-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",  // ← use direct URL here
  },
});
// prisma.config.ts
// import path from 'path';
// import { defineConfig } from 'prisma/config';
// import 'dotenv/config';

// export default defineConfig({
//   earlyAccess: true,
//   schema: path.join('prisma', 'schema.prisma'),
//   datasource: {
//     url: process.env.DATABASE_URL!,
//   },
// });