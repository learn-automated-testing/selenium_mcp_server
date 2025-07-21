import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


class TestLoginFlow:
    @pytest.fixture(scope="function")
    def driver(self):
        """Setup and teardown for each test"""
        # Setup Chrome driver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)
        driver.maximize_window()
        yield driver
        # Teardown
        driver.quit()

    def test_login_flow(self, driver):
        """Test the complete login flow"""
        # Navigate to login page
        driver.get("https://the-internet.herokuapp.com/login")
        
        # Wait for page to load
        wait = WebDriverWait(driver, 10)
        
        # Fill in username
        username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
        username_field.clear()
        username_field.send_keys("tomsmith")
        
        # Fill in password
        password_field = driver.find_element(By.ID, "password")
        password_field.clear()
        password_field.send_keys("SuperSecretPassword!")
        
        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait for page to load after login
        wait.until(EC.url_contains("/secure"))
        
        # Verify we reached the dashboard/secure area
        assert "secure" in driver.current_url
        assert "Welcome to the Secure Area" in driver.page_source
        
        print("Login flow test completed successfully!")


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 