import { Router } from 'express';
import { AdminController } from '../controller/adminController';

const router = Router();

router.get('/stats/overview', AdminController.getOverviewStats);

router.get('/stats/intents', (req, res) => {
  res.json({
    success: true,
    data: [
      { intent: 'search_product', count: 850 },
      { intent: 'compare_products', count: 210 },
      { intent: 'ask_recommendation', count: 185 }
    ]
  });
});

router.get('/audit/unresolved', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        date: "2026-05-12T10:30:00Z",
        userQuery: "I need a phone with a holographic display",
        detectedIntent: "search_product",
        reason: "No products matched the extracted filters"
      },
      {
        id: 2,
        date: "2026-05-12T09:15:00Z",
        userQuery: "How to cook a borsch?",
        detectedIntent: "unknown",
        reason: "Out of domain question"
      }
    ]
  });
});

export default router;