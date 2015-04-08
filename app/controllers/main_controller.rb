class MainController < ApplicationController
  require 'json'

  def map
    @found_user = User.find session[:user_id]
  end

  def about
    @found_user = User.find session[:user_id]
  end

  def search
    city = params[:city]
    wu_city = params[:city].squish.downcase.tr(" ","_")
    state = params[:state]
    neighborhood = params[:neighborhood]
    requestZillow = Typhoeus::Request.new(
      # ZWIS ID  X1-ZWz1e2kpo0z8cr_60bkd
      "https://www.zillow.com/webservice/GetDemographics.htm?zws-id=X1-ZWz1a9yr5r3pxn_14qhc&",
      method: :get,
      params: {
        city: city,
        neighborhood: neighborhood,
        state: state
      }
    )
    requestZillow.run
    @zillowData = JSON.parse(Hash.from_xml(requestZillow.response.body).to_json)
    requestWeather = Typhoeus::Request.new(
      "https://api.wunderground.com/api/acf7fb055f9d4a5d/geolookup/q/#{state}/#{wu_city}.json",
      method: :get
    )
    requestWeather.run
    @weatherData = JSON.parse(requestWeather.response.body)
    respond_to do |format|
      format.html
      format.json { render json: {
        :zillowData => @zillowData,
        :weatherData => @weatherData 
        }
      }
    end
  end

  def save_hood
    name = params[:name]
    city = params[:city]
    state = params[:state]
    @hood = Hood.create(name:name, city:city, state:state)
    render nothing: true
  end 

  def favorites
    @user = User.find session[:user_id]
    @fav_hoods = []
    favorites = @user.searches
    favorites.each do |favorite|
      if favorite.is_fav
        fav = Hood.find favorite.hood_id
        @fav_hoods << fav
      end
    end
  end

  def add_fav 
    user = User.find session[:user_id]
    hood = Hood.find_by name: params[:neighborhood], city: params[:city]
    @fav = Search.find_by user_id:user.id, hood_id:hood.id
    if @fav != nil
      if @fav.is_fav == true
        @fav.update_attributes(is_fav:false)
        respond_to do |format|
          format.json { render json: @fav }
        end
      else
        @fav.update_attributes(is_fav:true)
        respond_to do |format|
          format.json { render json: @fav }
        end
      end
    else
      @fav = Search.create(user_id:user.id, hood_id:hood.id, is_fav:true)
      respond_to do |format|
        format.json { render json: @fav }
      end
    end
  end

  def check_fav
    user = User.find session[:user_id]
    hood = Hood.find_by name: params[:neighborhood], city: params[:city]
    @fav = Search.find_by user_id:user.id, hood_id:hood.id
    if @fav != nil
      if @fav.is_fav == true
        respond_to do |format|
          format.json { render json: @fav }
        end
      else
        render nothing: true
      end
    end
  end


end
