import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System health thresholds
const LOW_STOCK_THRESHOLD = 10;
const CRITICAL_STOCK_THRESHOLD = 3;
const API_ERROR_THRESHOLD = 5;

// Track API errors to prevent alert spam
let recentApiErrors: {timestamp: Date, message: string}[] = [];

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Start monitoring task
    console.log(`Starting scheduled monitoring at ${new Date().toISOString()}`);
    
    // Log the scheduled task execution
    await createSystemLog(
      supabase,
      'system',
      'info',
      'scheduled-monitoring',
      `Scheduled monitoring started at ${new Date().toISOString()}`
    );
    
    // 1. Call the product-sync function to sync all products
    const syncUrl = `${supabaseUrl}/functions/v1/product-sync?action=sync-all`;
    
    console.log(`Starting scheduled sync at ${new Date().toISOString()}`);
    
    const response = await fetch(syncUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json"
      }
    });
    
    const result = await response.json();
    console.log(`Sync result: ${JSON.stringify(result)}`);
    
    // 2. Check for products that are out of stock or low stock
    await monitorProductStock(supabase);
    
    // 3. Check for failed transactions
    await monitorFailedTransactions(supabase);
    
    // 4. Check system health
    await monitorSystemHealth(supabase);
    
    // 5. Clean up old logs after a certain threshold
    await cleanupOldLogs(supabase);
    
    // Log the scheduled sync
    await supabase
      .from('sync_logs')
      .insert({
        action: 'scheduled-sync',
        status: result.success ? 'success' : 'error',
        message: result.message || `Scheduled sync completed: ${result.productsUpdated} products updated`
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Monitoring completed: ${result.productsUpdated} products updated`,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Scheduled monitoring error:', error);
    
    // Create Supabase client for logging error
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log the error
    await createSystemLog(
      supabase,
      'system',
      'error',
      'scheduled-monitoring',
      `Scheduled monitoring error: ${error.message}`
    );
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function monitorProductStock(supabase: any) {
  try {
    // Check for products that are out of stock or low stock
    const { data: lowStockProducts, error: stockError } = await supabase
      .from('products')
      .select('id, title, api_stock')
      .or(`api_stock.lt.${LOW_STOCK_THRESHOLD},api_stock.eq.0`)
      .eq('in_stock', true);
      
    if (stockError) {
      console.error('Error checking low stock products:', stockError);
      await createSystemLog(
        supabase,
        'products',
        'error',
        'stock-check',
        `Error checking low stock products: ${stockError.message}`
      );
      return;
    } 
    
    if (lowStockProducts && lowStockProducts.length > 0) {
      console.log(`Found ${lowStockProducts.length} products with low stock`);
      
      // Process each product based on stock level
      for (const product of lowStockProducts) {
        const stockLevel = product.api_stock;
        
        // Create appropriate notification based on stock level
        if (stockLevel === 0) {
          // Out of stock product - create error alert for admin
          await supabase
            .from('sync_logs')
            .insert({
              product_id: product.id,
              action: 'out-of-stock-alert',
              status: 'error',
              message: `Out of stock alert: ${product.title} has no items remaining`
            });
            
          // Create admin notification
          await createNotification(
            supabase, 
            'error', 
            `Product "${product.title}" is out of stock!`, 
            true
          );
        } else if (stockLevel <= CRITICAL_STOCK_THRESHOLD) {
          // Critical low stock - warning alert
          await supabase
            .from('sync_logs')
            .insert({
              product_id: product.id,
              action: 'critical-stock-alert',
              status: 'warning',
              message: `Critical stock alert: ${product.title} has only ${product.api_stock} items remaining`
            });
            
          // Create admin notification
          await createNotification(
            supabase, 
            'warning', 
            `Critical stock level: ${product.title} has only ${product.api_stock} items remaining`, 
            true
          );
        } else {
          // Low stock - info alert
          await supabase
            .from('sync_logs')
            .insert({
              product_id: product.id,
              action: 'low-stock-alert',
              status: 'info',
              message: `Low stock alert: ${product.title} has only ${product.api_stock} items remaining`
            });
        }
      }
    }
  } catch (error: any) {
    console.error('Error in stock monitoring:', error);
    await createSystemLog(
      supabase,
      'products',
      'error',
      'stock-monitoring',
      `Error in stock monitoring: ${error.message}`
    );
  }
}

async function monitorFailedTransactions(supabase: any) {
  try {
    // Check for failed transactions in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: failedTransactions, error: txError } = await supabase
      .from('transactions')
      .select('id, type, amount, created_at')
      .eq('status', 'error')
      .gte('created_at', oneDayAgo.toISOString());
      
    if (txError) {
      console.error('Error checking failed transactions:', txError);
      await createSystemLog(
        supabase,
        'transactions',
        'error',
        'transaction-check',
        `Error checking failed transactions: ${txError.message}`
      );
      return;
    }
    
    if (failedTransactions && failedTransactions.length > 0) {
      console.log(`Found ${failedTransactions.length} failed transactions in the last 24 hours`);
      
      // Create alert for admin
      await createSystemLog(
        supabase,
        'transactions',
        'warning',
        'failed-transactions-alert',
        `There are ${failedTransactions.length} failed transactions in the last 24 hours`
      );
      
      // Create admin notification
      await createNotification(
        supabase,
        'warning',
        `There are ${failedTransactions.length} failed transactions in the last 24 hours`,
        true
      );
    }
  } catch (error: any) {
    console.error('Error in transaction monitoring:', error);
    await createSystemLog(
      supabase,
      'transactions',
      'error',
      'transaction-monitoring',
      `Error in transaction monitoring: ${error.message}`
    );
  }
}

async function monitorSystemHealth(supabase: any) {
  try {
    // Clean up recent API errors (keep only errors from the last hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    recentApiErrors = recentApiErrors.filter(err => err.timestamp > oneHourAgo);
    
    // Check for recent API errors
    if (recentApiErrors.length >= API_ERROR_THRESHOLD) {
      await createSystemLog(
        supabase,
        'system',
        'error',
        'api-health-alert',
        `API health alert: ${recentApiErrors.length} API errors in the last hour`
      );
      
      // Create admin notification
      await createNotification(
        supabase,
        'error',
        `API health alert: ${recentApiErrors.length} API errors in the last hour`,
        true
      );
      
      // Reset the error count after alerting
      recentApiErrors = [];
    }
    
    // Check database connection
    try {
      const startTime = Date.now();
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const responseTime = Date.now() - startTime;
      
      // If query took too long, log a warning
      if (responseTime > 5000) {
        await createSystemLog(
          supabase,
          'system',
          'warning',
          'database-performance',
          `Database query performance warning: ${responseTime}ms response time`
        );
        
        // Create admin notification for slow database
        await createNotification(
          supabase,
          'warning',
          `Database performance warning: ${responseTime}ms response time for a simple query`,
          true
        );
      }
    } catch (dbError: any) {
      await createSystemLog(
        supabase,
        'system',
        'error',
        'database-connection',
        `Database connection error: ${dbError.message}`
      );
      
      // Create admin notification
      await createNotification(
        supabase,
        'error',
        `Database connection error: ${dbError.message}`,
        true
      );
    }
  } catch (error: any) {
    console.error('Error in system health monitoring:', error);
  }
}

async function cleanupOldLogs(supabase: any) {
  try {
    // Keep logs for 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Delete old sync logs
    await supabase
      .from('sync_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    console.log(`Cleaned up sync logs older than ${thirtyDaysAgo.toISOString()}`);
  } catch (error: any) {
    console.error('Error cleaning up old logs:', error);
  }
}

async function createSystemLog(
  supabase: any, 
  category: string, 
  level: 'info' | 'warning' | 'error',
  action: string,
  message: string
) {
  try {
    await supabase
      .from('sync_logs')
      .insert({
        action: `${category}:${action}`,
        status: level,
        message
      });
      
    if (level === 'error') {
      // Track API errors for system health monitoring
      recentApiErrors.push({
        timestamp: new Date(),
        message
      });
    }
  } catch (error: any) {
    console.error(`Failed to create system log: ${error.message}`);
  }
}

async function createNotification(
  supabase: any,
  type: 'info' | 'success' | 'warning' | 'error',
  message: string,
  adminOnly: boolean = false
) {
  try {
    await supabase
      .from('notifications')
      .insert({
        type,
        message,
        admin_only: adminOnly,
        read: false
      });
  } catch (error: any) {
    console.error(`Failed to create notification: ${error.message}`);
  }
}
