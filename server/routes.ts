import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPlayerRegistrationSchema, insertWeeklyGameSchema } from "@shared/schema";
import cron from "node-cron";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game management routes
  app.get('/api/current-game', isAuthenticated, async (req, res) => {
    try {
      let currentGame = await storage.getCurrentWeekGame();
      
      // If no current game exists, create one for this Saturday
      if (!currentGame) {
        const now = new Date();
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + (6 - now.getDay())); // Next Saturday
        saturday.setHours(14, 0, 0, 0); // 2 PM
        
        currentGame = await storage.createWeeklyGame({
          gameDate: saturday,
          isFrozen: false,
        });
      }
      
      res.json(currentGame);
    } catch (error) {
      console.error("Error fetching current game:", error);
      res.status(500).json({ message: "Failed to fetch current game" });
    }
  });

  app.get('/api/game/:gameId/registrations', isAuthenticated, async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const registrations = await storage.getGameRegistrations(gameId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.post('/api/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameId } = req.body;
      
      const validatedData = insertPlayerRegistrationSchema.parse({
        userId,
        gameId,
      });

      // Check if game is frozen
      const currentGame = await storage.getCurrentWeekGame();
      if (currentGame?.isFrozen) {
        return res.status(400).json({ message: "Registration is closed for this week" });
      }

      // Check if user is already registered
      const existingRegistration = await storage.getUserRegistrationForGame(userId, gameId);
      if (existingRegistration) {
        return res.status(400).json({ message: "You are already registered for this game" });
      }

      const registration = await storage.registerPlayer(validatedData);
      res.json(registration);
    } catch (error) {
      console.error("Error registering player:", error);
      res.status(500).json({ message: "Failed to register player" });
    }
  });

  app.delete('/api/unregister', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameId } = req.body;

      // Check if game is frozen
      const currentGame = await storage.getCurrentWeekGame();
      if (currentGame?.isFrozen) {
        return res.status(400).json({ message: "Registration is closed for this week" });
      }

      await storage.removePlayerRegistration(userId, gameId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unregistering player:", error);
      res.status(500).json({ message: "Failed to unregister player" });
    }
  });

  app.get('/api/my-registration/:gameId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameId = parseInt(req.params.gameId);
      
      const registration = await storage.getUserRegistrationForGame(userId, gameId);
      res.json({ isRegistered: !!registration });
    } catch (error) {
      console.error("Error checking registration:", error);
      res.status(500).json({ message: "Failed to check registration" });
    }
  });

  // Setup cron jobs for automatic scheduling
  setupScheduling();

  const httpServer = createServer(app);
  return httpServer;
}

function setupScheduling() {
  // Freeze registrations every Friday at 11:59 PM
  cron.schedule('59 23 * * 5', async () => {
    try {
      console.log('Freezing current week registration...');
      const currentGame = await storage.getCurrentWeekGame();
      if (currentGame && !currentGame.isFrozen) {
        await storage.freezeGame(currentGame.id);
        console.log('Registration frozen for current week');
      }
    } catch (error) {
      console.error('Error freezing registration:', error);
    }
  });

  // Reset and clean up every Sunday at 12:00 AM
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log('Cleaning up old games...');
      await storage.deleteOldGames();
      console.log('Old games cleaned up');
    } catch (error) {
      console.error('Error cleaning up old games:', error);
    }
  });
}
