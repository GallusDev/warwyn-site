<template>
  <div class="container">
    <div class="header">
      <h2>News Posts</h2>
      <router-link to="/admin/news/new">
        <button>+ New Post</button>
      </router-link>
    </div>

    <div v-if="loading">Loading news posts...</div>
    <div v-else>
      <div v-for="post in newsPosts" :key="post.id" class="news-card">
        <img :src="post.displayImage" alt="Display Image" class="news-img" />
        <h3>{{ post.title }}</h3>
        <p class="category">{{ post.category }}</p>
        <div class="news-actions">
          <router-link :to="`/admin/news/edit/${post.id}`"><button>Edit</button></router-link>
          <button @click="deletePost(post.id)">Delete</button>
        </div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="!canGoBack">Previous</button>
        <button @click="nextPage" :disabled="!canGoForward">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc } from 'firebase/firestore';
import NewsPostModal from './NewsPostEditor.vue';

export default {
  components: { NewsPostModal },
  setup() {
    const newsPosts = ref([]);
    const lastVisible = ref(null);
    const firstVisible = ref(null);
    const canGoBack = ref(false);
    const canGoForward = ref(false);
    const modals = ref({ open: false });
    const selectedPost = ref(null);
    const loading = ref(true);
    const pageStack = [];

    const fetchPosts = async (direction = 'initial') => {
      loading.value = true;
      let q = query(collection(db, 'news_posts'), orderBy('createdAt', 'desc'), limit(10));

      if (direction === 'next' && lastVisible.value) {
        q = query(collection(db, 'news_posts'), orderBy('createdAt', 'desc'), startAfter(lastVisible.value), limit(10));
      }

      const snapshot = await getDocs(q);
      if (direction === 'next') pageStack.push(lastVisible.value);
      if (direction === 'prev') snapshot.docs.length && pageStack.pop();

      newsPosts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      firstVisible.value = snapshot.docs[0];
      lastVisible.value = snapshot.docs[snapshot.docs.length - 1];

      canGoBack.value = pageStack.length > 0;
      canGoForward.value = snapshot.docs.length === 10;
      loading.value = false;
    };

    const openNewPostModal = () => {
      selectedPost.value = null;
      modals.value.open = true;
    };

    const editPost = (post) => {
      selectedPost.value = post;
      modals.value.open = true;
    };

    const deletePost = async (id) => {
      if (confirm('Are you sure you want to delete this post?')) {
        await deleteDoc(doc(db, 'news_posts', id));
        fetchPosts();
      }
    };

    const closeModal = () => {
      modals.value.open = false;
      selectedPost.value = null;
      fetchPosts();
    };

    const handleSave = () => closeModal();
    const nextPage = () => fetchPosts('next');
    const prevPage = () => fetchPosts('prev');

    onMounted(fetchPosts);

    return {
      newsPosts,
      modals,
      selectedPost,
      loading,
      canGoBack,
      canGoForward,
      openNewPostModal,
      editPost,
      deletePost,
      closeModal,
      handleSave,
      nextPage,
      prevPage
    };
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.news-card {
  background: #2a2a2a;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
}
.news-img {
  max-width: 10%;
  height: auto;
  border-radius: 4px;
}
.category {
  font-style: italic;
  color: #aaa;
}
.news-actions {
  margin-top: 0.5rem;
}
.news-actions button {
  margin-right: 0.5rem;
}
.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>