<template>
  <div class="editor-page">
    <h2>{{ isEditing ? 'Edit News Post' : 'Create News Post' }}</h2>
    <form @submit.prevent="submitPost">
      <label>Title:
        <input v-model="post.title" required />
      </label>

      <label>Display Image URL:
        <input v-model="post.displayImage" />
      </label>

      <label>Category:
        <select v-model="post.category" required>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </label>

      <label>Content:</label>
      <QuillEditor
          v-if="contentLoaded"
          v-model:content="content"
          contentType="html"
          toolbar="full"
          theme="snow"
          class="editor"
      />
      <!-- <quill-editor v-model:content="post.content" contentType="html" class="editor" theme="snow" /> -->

      <div class="actions">
        <button type="submit">{{ isEditing ? 'Update Post' : 'Create Post' }}</button>
        <router-link to="/admin/news"><button type="button">Cancel</button></router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  components: { QuillEditor },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const isEditing = ref(!!route.params.id);
    const post = ref({
      title: '',
      displayImage: '',
      category: '',
      content: '',
    });

    const categories = [
      'Community', 'Game Updates', 'Dev Blogs', 'Support', 'Behind The Scenes',
      'Future Updates', 'Technical', 'Events', 'Website'
    ];

    const content = ref('');
    const contentLoaded = ref(!isEditing.value); // already true if creating

    const fetchPost = async () => {
      const id = route.params.id;
      if (!id) return;

      const snap = await getDoc(doc(db, 'news_posts', id));
      if (snap.exists()) {
        const data = snap.data();
        post.value = { ...data, id: snap.id };
        content.value = data.content || '';
      }

      contentLoaded.value = true;
    };

    const submitPost = async () => {
      const postData = {
        ...post.value,
        content: content.value,
      };

      if (isEditing.value) {
        await updateDoc(doc(db, 'news_posts', post.value.id), postData);
      } else {
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await setDoc(doc(db, 'news_posts', id), {
          ...postData,
          createdAt: serverTimestamp(),
        });
      }
      router.push('/admin/news');
    };

    onMounted(() => {
      if (isEditing.value) fetchPost();
    });

    return {
      post,
      categories,
      submitPost,
      isEditing,
      contentLoaded,
      content
    };
  }
};
</script>

<style scoped>
.editor-page {
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: #1f1f1f;
  border-radius: 8px;
  color: white;
  box-sizing: border-box;
}

label {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0 1rem;
  border: 1px solid #444;
  background: #2a2a2a;
  color: white;
  border-radius: 4px;
}

.editor {
  flex: 1;
  min-height: 400px;
  border: 1px solid #444;
  background: white;
  color: black;
  padding: 0;
  margin-bottom: 1rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>