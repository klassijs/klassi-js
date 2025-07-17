/**
 * Bundled Visual Validation Module for Klassi-js
 * This module provides visual validation functionality without external dependencies
 */

const fs = require('fs-extra');
const path = require('path');
const { astellen } = require('klassijs-astellen');

// Set up required global variables that the visual validation module expects
if (typeof global.BROWSER_NAME === 'undefined') {
  global.BROWSER_NAME = 'chrome'; // Default browser
}

if (typeof global.browserName === 'undefined') {
  global.browserName = global.BROWSER_NAME;
}

// Create a wrapper that ensures all internal requires resolve from klassi-js context
const createVisualValidationWrapper = () => {
  // Override require.resolve temporarily to ensure dependencies are loaded from klassi-js context
  const originalResolve = require.resolve;
  
  require.resolve = (id, options) => {
    try {
      // Try to resolve from klassi-js context first
      return originalResolve(id, { ...options, paths: [__dirname, '..'] });
    } catch (error) {
      // Fall back to original resolution
      return originalResolve(id, options);
    }
  };
  
  try {
    // Import the visual validation functionality
    const visualValidationPath = require.resolve('klassijs-visual-validation', { paths: [__dirname, '..'] });
    const { takeImage, compareImage, ImageAssertion } = require(visualValidationPath);
    
    // Create a wrapper for the takeImage function
    const wrappedTakeImage = async (fileName, elementSnapshot, elementsToHide = '', shouldCompare = true, expectedTolerance = 0.2) => {
      try {
        return await takeImage(fileName, elementSnapshot, elementsToHide, shouldCompare, expectedTolerance);
      } catch (error) {
        console.error('Error in takeImage:', error.message);
        throw error;
      }
    };
    
    // Create a wrapper for the compareImage function
    const wrappedCompareImage = async (fileName) => {
      try {
        return await compareImage(fileName);
      } catch (error) {
        console.error('Error in compareImage:', error.message);
        throw error;
      }
    };
    
    // Create a wrapper for the ImageAssertion class
    const WrappedImageAssertion = class extends ImageAssertion {
      constructor(fileName, expected, result, value) {
        super(fileName, expected, result, value);
      }
    };
    
    // Restore original require.resolve
    require.resolve = originalResolve;
    
    return {
      takeImage: wrappedTakeImage,
      compareImage: wrappedCompareImage,
      ImageAssertion: WrappedImageAssertion
    };
  } catch (error) {
    // Restore original require.resolve
    require.resolve = originalResolve;
    console.error('Error loading visual validation module:', error.message);
    throw error;
  }
};

module.exports = createVisualValidationWrapper(); 