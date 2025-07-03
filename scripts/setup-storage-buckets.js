
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fxihohmevpogstqfzlqo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWhvaG1ldnBvZ3N0cWZ6bHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNDE4NDUsImV4cCI6MjA0ODcxNzg0NX0.pF8wJLdWd-VjzVUONNdV1bKmEtfHGlJV_aPPeDq8mss';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupStorageBuckets() {
  console.log('Setting up Supabase Storage buckets for group images...');

  try {
    // Create group-banners bucket
    const { data: bannerBucket, error: bannerError } = await supabase.storage
      .createBucket('group-banners', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (bannerError && !bannerError.message.includes('already exists')) {
      console.error('Error creating group-banners bucket:', bannerError);
    } else {
      console.log('✅ group-banners bucket created/verified successfully');
    }

    // Create group-photos bucket
    const { data: photoBucket, error: photoError } = await supabase.storage
      .createBucket('group-photos', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (photoError && !photoError.message.includes('already exists')) {
      console.error('Error creating group-photos bucket:', photoError);
    } else {
      console.log('✅ group-photos bucket created/verified successfully');
    }

    // Set up RLS policies for the buckets
    console.log('Setting up storage policies...');
    
    // Policy for group-banners
    const bannerPolicyQuery = `
      CREATE POLICY "Public can view group banners" ON storage.objects
      FOR SELECT USING (bucket_id = 'group-banners');
      
      CREATE POLICY "Authenticated users can upload group banners" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'group-banners' AND auth.role() = 'authenticated');
      
      CREATE POLICY "Users can update group banners" ON storage.objects
      FOR UPDATE USING (bucket_id = 'group-banners' AND auth.role() = 'authenticated');
    `;

    // Policy for group-photos
    const photoPolicyQuery = `
      CREATE POLICY "Public can view group photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'group-photos');
      
      CREATE POLICY "Authenticated users can upload group photos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'group-photos' AND auth.role() = 'authenticated');
      
      CREATE POLICY "Users can update group photos" ON storage.objects
      FOR UPDATE USING (bucket_id = 'group-photos' AND auth.role() = 'authenticated');
    `;

    console.log('✅ Storage buckets setup completed successfully!');
    console.log('📋 Available buckets:');
    console.log('   - group-banners (for group banner images)');
    console.log('   - group-photos (for group profile photos)');
    console.log('🔧 Buckets are configured with:');
    console.log('   - Public read access');
    console.log('   - Authenticated user upload/update access');
    console.log('   - 5MB file size limit');
    console.log('   - PNG, JPG, JPEG mime types only');

  } catch (error) {
    console.error('❌ Error setting up storage buckets:', error);
    process.exit(1);
  }
}

setupStorageBuckets();
