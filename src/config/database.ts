import mongoose from 'mongoose';

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUri = 'mongodb+srv://20210680:20210680@paqueteria-dd.j90aohq.mongodb.net/paqueteria-dd?retryWrites=true&w=majority';
      
      await mongoose.connect(mongoUri, {
        dbName: 'paqueteria-dd',
      });

      this.isConnected = true;
      console.log('✅ Connected to MongoDB Atlas');

      // Manejar eventos de conexión
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Error connecting to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔒 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Función helper para conectar fácilmente desde el archivo principal
export const connectDB = async (): Promise<void> => {
  const database = Database.getInstance();
  await database.connect();
};

// Función helper para desconectar
export const disconnectDB = async (): Promise<void> => {
  const database = Database.getInstance();
  await database.disconnect();
};
