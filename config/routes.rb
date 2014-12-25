Rails.application.routes.draw do

root "home#index"
post "/search" => "home#search"
end
