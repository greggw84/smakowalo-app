/**
 * Utility functions for populating missing product data from OpenCart product_attributes table.
 *
 * The product_attributes table has columns:
 * - id: primary key
 * - product_id: foreign key to products.id
 * - attribute_id: identifies which attribute (name, description, etc.)
 * - language_id: language identifier
 * - text: the attribute value
 *
 * TODO: Determine the correct attribute_id mappings from OpenCart:
 * - Name attribute_id: unknown (needs to be identified from OpenCart database)
 * - Description attribute_id: unknown (needs to be identified from OpenCart database)
 *
 * Once the mappings are known, update the constants below and uncomment the implementation.
 */

import { createClient } from "@supabase/supabase-js";

// TODO: Update these with actual attribute_id values from OpenCart
// You can find these by querying: SELECT DISTINCT attribute_id, text FROM product_attributes LIMIT 100
const ATTRIBUTE_ID_NAME = -1; // Placeholder - set to actual attribute_id for product name
const ATTRIBUTE_ID_DESCRIPTION = -1; // Placeholder - set to actual attribute_id for description
const DEFAULT_LANGUAGE_ID = 1; // Usually 1 for default language, adjust if needed

interface PopulateResult {
  success: boolean;
  updated: number;
  errors: string[];
  message: string;
}

/**
 * Populate missing product name and description from product_attributes table.
 *
 * @param supabaseUrl - Supabase project URL
 * @param supabaseServiceKey - Supabase service role key
 * @returns Result object with count of updated products
 *
 * @example
 * ```ts
 * const result = await populateMissingProductData(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.SUPABASE_SERVICE_ROLE_KEY!
 * );
 * console.log(`Updated ${result.updated} products`);
 * ```
 */
export async function populateMissingProductData(
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<PopulateResult> {
  const result: PopulateResult = {
    success: false,
    updated: 0,
    errors: [],
    message: "",
  };

  // Check if attribute IDs are configured
  if (ATTRIBUTE_ID_NAME === -1 || ATTRIBUTE_ID_DESCRIPTION === -1) {
    result.message =
      "Attribute ID mappings not configured. " +
      "Please update ATTRIBUTE_ID_NAME and ATTRIBUTE_ID_DESCRIPTION " +
      "constants in src/utils/populateProductAttributes.ts with values from OpenCart.";
    return result;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find products with missing name or description
    const { data: productsToUpdate, error: fetchError } = await supabase
      .from("products")
      .select("id, name, description")
      .or("name.is.null,description.is.null,name.eq.,description.eq.");

    if (fetchError) {
      result.errors.push(`Error fetching products: ${fetchError.message}`);
      return result;
    }

    if (!productsToUpdate || productsToUpdate.length === 0) {
      result.success = true;
      result.message = "No products with missing data found.";
      return result;
    }

    // Process each product
    for (const product of productsToUpdate) {
      try {
        // Get name attribute if product name is missing
        if (!product.name || product.name.trim() === "") {
          const { data: nameAttr } = await supabase
            .from("product_attributes")
            .select("text")
            .eq("product_id", product.id)
            .eq("attribute_id", ATTRIBUTE_ID_NAME)
            .eq("language_id", DEFAULT_LANGUAGE_ID)
            .single();

          if (nameAttr?.text) {
            const { error: updateError } = await supabase
              .from("products")
              .update({ name: nameAttr.text })
              .eq("id", product.id);

            if (updateError) {
              result.errors.push(
                `Error updating name for product ${product.id}: ${updateError.message}`
              );
            } else {
              result.updated++;
            }
          }
        }

        // Get description attribute if product description is missing
        if (!product.description || product.description.trim() === "") {
          const { data: descAttr } = await supabase
            .from("product_attributes")
            .select("text")
            .eq("product_id", product.id)
            .eq("attribute_id", ATTRIBUTE_ID_DESCRIPTION)
            .eq("language_id", DEFAULT_LANGUAGE_ID)
            .single();

          if (descAttr?.text) {
            const { error: updateError } = await supabase
              .from("products")
              .update({ description: descAttr.text })
              .eq("id", product.id);

            if (updateError) {
              result.errors.push(
                `Error updating description for product ${product.id}: ${updateError.message}`
              );
            } else {
              result.updated++;
            }
          }
        }
      } catch (productError) {
        result.errors.push(
          `Error processing product ${product.id}: ${String(productError)}`
        );
      }
    }

    result.success = true;
    result.message = `Processed ${productsToUpdate.length} products, updated ${result.updated} fields.`;

    if (result.errors.length > 0) {
      result.message += ` Encountered ${result.errors.length} errors.`;
    }

    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${String(error)}`);
    return result;
  }
}

/**
 * Get sample product attributes to help identify the correct attribute_id mappings.
 * Run this to see what attribute IDs are available in your OpenCart data.
 */
export async function getSampleProductAttributes(
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<{
  success: boolean;
  samples: Array<{
    attribute_id: number;
    language_id: number;
    sample_text: string;
    count: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get distinct attribute_ids with sample values
    const { data: attributes, error } = await supabase
      .from("product_attributes")
      .select("attribute_id, language_id, text")
      .limit(100);

    if (error) {
      return {
        success: false,
        samples: [],
        error: error.message,
      };
    }

    // Group by attribute_id and count occurrences
    const grouped = new Map<
      string,
      { attribute_id: number; language_id: number; sample_text: string; count: number }
    >();

    for (const attr of attributes || []) {
      const key = `${attr.attribute_id}-${attr.language_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          attribute_id: attr.attribute_id,
          language_id: attr.language_id,
          sample_text: attr.text?.substring(0, 100) || "",
          count: 1,
        });
      } else {
        const existing = grouped.get(key);
        if (existing) {
          existing.count++;
        }
      }
    }

    return {
      success: true,
      samples: Array.from(grouped.values()),
    };
  } catch (error) {
    return {
      success: false,
      samples: [],
      error: String(error),
    };
  }
}
