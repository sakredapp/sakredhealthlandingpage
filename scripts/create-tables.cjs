const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    console.log("✓ users");

    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        featured_image TEXT,
        featured_image_alt TEXT,
        tags TEXT[],
        published BOOLEAN DEFAULT true,
        published_at TIMESTAMP DEFAULT NOW(),
        seo_title TEXT,
        seo_description TEXT,
        seo_keywords TEXT[],
        canonical_url TEXT,
        og_image TEXT,
        llm_summary TEXT,
        status TEXT DEFAULT 'draft',
        draft_content TEXT,
        preview_token TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ blog_posts");

    await client.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        object_path TEXT NOT NULL,
        url TEXT,
        alt TEXT,
        blog_post_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ media_assets");

    await client.query(`
      CREATE TABLE IF NOT EXISTS demo_videos (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        "order" TEXT DEFAULT '0'
      );
    `);
    console.log("✓ demo_videos");

    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT,
        avatar_url TEXT,
        quote TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ testimonials");

    await client.query(`
      CREATE TABLE IF NOT EXISTS video_analytics (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id VARCHAR NOT NULL,
        event_type TEXT NOT NULL,
        session_id TEXT,
        watch_time INTEGER DEFAULT 0,
        progress_percent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ video_analytics");

    await client.query(`
      CREATE TABLE IF NOT EXISTS ab_test_variants (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        test_name TEXT NOT NULL,
        variant_name TEXT NOT NULL,
        button_text TEXT,
        button_color TEXT,
        headline TEXT,
        subheadline TEXT,
        active BOOLEAN DEFAULT true,
        weight INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ ab_test_variants");

    await client.query(`
      CREATE TABLE IF NOT EXISTS ab_test_conversions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        test_name TEXT NOT NULL,
        variant_id VARCHAR NOT NULL,
        session_id TEXT,
        conversion_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ ab_test_conversions");

    console.log("\nAll tables created successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();
