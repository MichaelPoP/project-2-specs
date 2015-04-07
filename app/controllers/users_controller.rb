class UsersController < ApplicationController
  before_action :prevent_login_signup, only: [:signup, :login]

  def signup
    @user = User.new
  end

  def login
  end 

  def attempt_login
    if params[:username].present? && params[:password].present?
      found_user = User.find_by_username params[:username]
      if found_user
        authorized_user = found_user.authenticate params[:password]
      end
    end
    if !found_user
      flash.now[:notice] = "Wrong username or password. Please try again."
      render :login
    elsif !authorized_user
      flash.now[:notice] = "Wrong username or password. Please try again."
      render :login
    else
      session[:user_id] = authorized_user.id
      redirect_to map_path
    end
  end


  def home
    user_id = session[:user_id]
    @found_user = User.find(user_id)
    redirect_to map_path
  end

  def logout
    session[:user_id] = nil
    redirect_to root_path
  end

  def create
    @user = User.new user_params
    if @user.save
      session[:user_id] = @user.id
      redirect_to map_path
    else
      flash.now[:notice] = "Username and Password can't be blank."
      render :signup
    end
  end

private 
  def prevent_login_signup
    if session[:user_id]
      redirect_to map_path
    end
  end
  
  def user_params
    params.require(:user).permit(:username, :password, :password_digest)
  end
end

