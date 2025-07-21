#!/usr/bin/env python3
"""Debug script to test snapshot capture and element detection."""

import asyncio
import sys
from pathlib import Path

# Add path for imports
sys.path.append(str(Path(__file__).parent))

from selenium_mcp.context import Context
from selenium_mcp.tools import get_all_tools

async def debug_snapshot():
    """Debug snapshot capture on a real website with cookie banners."""
    print("🧪 Debugging snapshot capture...")
    
    tools = get_all_tools()
    context = Context(tools)
    
    try:
        # Navigate to a site with cookie banners
        driver = await context.ensure_browser()
        print("✅ Browser initialized")
        
        # Test on a site known to have cookie banners
        test_url = "https://example.com"
        driver.get(test_url)
        print(f"✅ Navigated to {test_url}")
        
        # Wait a moment for page to load
        await asyncio.sleep(2)
        
        # Capture snapshot
        await context.capture_snapshot()
        print("✅ Snapshot captured")
        
        if context.current_snapshot:
            print(f"\n📊 Snapshot Results:")
            print(f"  URL: {context.current_snapshot.url}")
            print(f"  Title: {context.current_snapshot.title}")
            print(f"  Elements found: {len(context.current_snapshot.elements)}")
            
            # Show first 10 elements
            print(f"\n🔍 First 10 elements:")
            for i, (ref, element) in enumerate(list(context.current_snapshot.elements.items())[:10]):
                print(f"  {i+1}. {ref}: {element.tag_name}")
                print(f"     Text: {element.text[:50] if element.text else 'None'}...")
                print(f"     Clickable: {element.is_clickable}")
                print(f"     Classes: {element.css_classes}")
                print()
        else:
            print("❌ No snapshot data captured")
        
        # Now test on a site with actual cookie banners
        print("\n🍪 Testing on site with cookie banners...")
        cookie_sites = [
            "https://www.bbc.com",
            "https://www.cnn.com", 
            "https://www.guardian.com"
        ]
        
        for site in cookie_sites:
            try:
                print(f"\n🌐 Testing {site}...")
                driver.get(site)
                await asyncio.sleep(3)  # Wait for cookie banner
                
                await context.capture_snapshot()
                
                if context.current_snapshot:
                    # Look for cookie-related elements
                    cookie_elements = []
                    for ref, element in context.current_snapshot.elements.items():
                        text = element.text.lower() if element.text else ""
                        classes = " ".join(element.css_classes).lower()
                        
                        if any(keyword in text or keyword in classes for keyword in 
                               ["accept", "cookie", "consent", "agree", "allow", "ok"]):
                            cookie_elements.append((ref, element))
                    
                    print(f"  Total elements: {len(context.current_snapshot.elements)}")
                    print(f"  Cookie-related elements: {len(cookie_elements)}")
                    
                    for ref, element in cookie_elements[:5]:  # Show first 5
                        print(f"    {ref}: {element.tag_name} - '{element.text[:30] if element.text else 'No text'}' - Clickable: {element.is_clickable}")
                
                break  # Test only first successful site
                
            except Exception as e:
                print(f"  ❌ Failed to test {site}: {e}")
                continue
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await context.close()

if __name__ == "__main__":
    asyncio.run(debug_snapshot())