import { supabase } from './supabase';

export interface EscalationProcessorConfig {
  intervalMinutes: number;
  enabled: boolean;
  maxRetries: number;
}

export class EscalationProcessor {
  private static instance: EscalationProcessor;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private config: EscalationProcessorConfig = {
    intervalMinutes: 15, // Check every 15 minutes
    enabled: true,
    maxRetries: 3
  };

  private constructor() {}

  static getInstance(): EscalationProcessor {
    if (!EscalationProcessor.instance) {
      EscalationProcessor.instance = new EscalationProcessor();
    }
    return EscalationProcessor.instance;
  }

  configure(config: Partial<EscalationProcessorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  start(): void {
    if (this.intervalId) {
      console.log('Escalation processor already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('Escalation processor is disabled');
      return;
    }

    console.log(`Starting escalation processor with ${this.config.intervalMinutes} minute interval`);
    
    // Run immediately
    this.processEscalations();
    
    // Schedule recurring runs
    this.intervalId = setInterval(() => {
      this.processEscalations();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Escalation processor stopped');
    }
  }

  async processEscalations(): Promise<number> {
    if (this.isProcessing) {
      console.log('Escalation processing already in progress, skipping...');
      return 0;
    }

    this.isProcessing = true;
    let processedCount = 0;
    let retryCount = 0;

    try {
      console.log('Processing escalations...');

      while (retryCount < this.config.maxRetries) {
        try {
          const { data, error } = await supabase.rpc('process_leave_request_escalations');
          
          if (error) {
            console.error(`Escalation processing error (attempt ${retryCount + 1}):`, error);
            retryCount++;
            
            if (retryCount >= this.config.maxRetries) {
              throw error;
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            continue;
          }

          processedCount = data || 0;
          break;
        } catch (rpcError) {
          console.error(`RPC call failed (attempt ${retryCount + 1}):`, rpcError);
          retryCount++;
          
          if (retryCount >= this.config.maxRetries) {
            throw rpcError;
          }
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      if (processedCount > 0) {
        console.log(`✅ Processed ${processedCount} escalation(s)`);
        
        // Emit event for real-time updates (if you have a WebSocket connection)
        window.dispatchEvent(new CustomEvent('escalationProcessed', {
          detail: { count: processedCount, timestamp: new Date() }
        }));
      } else {
        console.log('No escalations to process');
      }

      // Log successful processing
      await this.logProcessingEvent('success', processedCount);

    } catch (error) {
      console.error('Failed to process escalations after all retries:', error);
      
      // Log failed processing
      await this.logProcessingEvent('error', 0, error instanceof Error ? error.message : 'Unknown error');
      
      throw error;
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }

  private async logProcessingEvent(status: 'success' | 'error', count: number, errorMessage?: string): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        organization_id: null, // System-level log
        user_id: null,
        entity_type: 'escalation_processor',
        action: 'process',
        new_values: {
          status,
          escalations_processed: count,
          error_message: errorMessage
        },
        metadata: {
          processor_version: '1.0.0',
          interval_minutes: this.config.intervalMinutes,
          retry_count: this.config.maxRetries,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Failed to log escalation processing event:', logError);
      // Don't throw here as logging failure shouldn't break the processor
    }
  }

  getStatus(): { 
    running: boolean; 
    processing: boolean; 
    config: EscalationProcessorConfig;
    lastRun?: Date;
  } {
    return {
      running: this.intervalId !== null,
      processing: this.isProcessing,
      config: this.config
    };
  }

  // Manual trigger for admin dashboard
  async manualProcess(): Promise<number> {
    if (this.isProcessing) {
      throw new Error('Escalation processing already in progress');
    }

    console.log('Manual escalation processing triggered');
    return this.processEscalations();
  }

  // Health check for monitoring
  async healthCheck(): Promise<{ 
    status: 'healthy' | 'unhealthy'; 
    details: any;
    timestamp: string;
  }> {
    try {
      // Test database connection
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('id')
        .limit(1);

      if (error) {
        return {
          status: 'unhealthy',
          details: { error: error.message, component: 'database' },
          timestamp: new Date().toISOString()
        };
      }

      // Check if processor is running
      const isRunning = this.intervalId !== null;
      
      return {
        status: isRunning && this.config.enabled ? 'healthy' : 'unhealthy',
        details: {
          processor_running: isRunning,
          processor_enabled: this.config.enabled,
          currently_processing: this.isProcessing,
          config: this.config
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          component: 'health_check' 
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance for global access
export const escalationProcessor = EscalationProcessor.getInstance();

// Auto-start processor in browser environment
if (typeof window !== 'undefined') {
  // Start with a delay to ensure app is initialized
  setTimeout(() => {
    escalationProcessor.start();
  }, 5000); // 5 second delay

  // Handle page visibility changes to pause/resume processor
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      escalationProcessor.stop();
    } else {
      escalationProcessor.start();
    }
  });

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    escalationProcessor.stop();
  });
}

// React hook for using escalation processor in components
export function useEscalationProcessor() {
  const [status, setStatus] = React.useState(escalationProcessor.getStatus());
  
  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(escalationProcessor.getStatus());
    };

    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    
    // Listen for custom events
    const handleEscalationProcessed = () => updateStatus();
    window.addEventListener('escalationProcessed', handleEscalationProcessed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('escalationProcessed', handleEscalationProcessed);
    };
  }, []);

  return {
    status,
    manualProcess: () => escalationProcessor.manualProcess(),
    configure: (config: Partial<EscalationProcessorConfig>) => escalationProcessor.configure(config),
    healthCheck: () => escalationProcessor.healthCheck()
  };
}

// TypeScript import fix
declare const React: any;