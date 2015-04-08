require 'rails_helper'

feature "visitor logs in" do   
    scenario "success" do

        #setup phase
        u = User.create(username: "DoyleMcpoyle", password: "pat")
        visit login_path


        #exercise phase
        fill_in "Username", with: "DoyleMcpoyle"
        fill_in "Password", with: "pat"
        click_button "Go"


        #verify
        expect(page).to have_content("Welcome DoyleMcpoyle!") 
    end
    scenario "denied" do
        visit root_path

        fill_in "Username", with: "asdf"
        fill_in "Password", with: "asdf"
        click_button "Go"

        expect(page).to have_content("Literally the best website ever. Username Password Don't have an account? Sign up here") #throw a flash message "invalid username or pw"
    end
end 