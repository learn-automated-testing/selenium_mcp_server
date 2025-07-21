*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    https://www.parkos.nl
${BROWSER}    Chrome
${CHEAPEST_PRICE}    € 8,50 / dag

*** Test Cases ***
Parkos Schiphol Cheapest Price
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//button[normalize-space(text())='Alles toestaan']    10s
    Click Button    xpath=//button[normalize-space(text())='Alles toestaan']
    Wait Until Element Is Visible    xpath=//button[normalize-space(text())='Vliegveld']    10s
    Click Button    xpath=//button[normalize-space(text())='Vliegveld']
    Wait Until Element Is Visible    xpath=//input[@aria-label='airport search input']    10s
    Input Text    xpath=//input[@aria-label='airport search input']    Schiphol Airport
    Wait Until Element Is Visible    xpath=//button[contains(.,'Schiphol Airport')]    10s
    Click Button    xpath=//button[contains(.,'Schiphol Airport')]
    Wait Until Element Is Visible    xpath=//button[contains(@aria-label,'Datum van')]    10s
    Click Button    xpath=//button[contains(@aria-label,'Datum van')]
    # Select today's date (example: 28 for 28th of the month)
    Click Button    xpath=//button[normalize-space(text())='28']
    Click Button    xpath=//button[contains(.,'Zoek een parkeerplek')]
    Wait Until Page Contains Element    xpath=//main//article[1]//p[contains(text(),'€')]    15s
    ${price}=    Get Text    xpath=(//main//article//p[contains(text(),'€')])[1]
    Should Be Equal    ${price}    ${CHEAPEST_PRICE}
    [Teardown]    Close Browser 