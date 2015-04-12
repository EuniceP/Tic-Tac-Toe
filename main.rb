require_relative 'building'
require_relative 'apartment'
require_relative 'person'
# A renter wants to rent an apartment from a landlord.
# Renter: 
# LandLord: 
# Apartment: 
# Building

building = Building.new("123 Fake St")

building.apartments = [
  Apartment.new("512",450,900,1,1), 
  Apartment.new("100",1000,1000,2,3)
]

building.apartments[0].renters = [
  Renter.new(),
  Renter.new()
]


claud = Renter.new("Claude", 770, "312-555-1240")
claude.aparment = building.apartments[0]
building.apartments[0].renters[0] = claud
# building.apartments[0].is_occupied?  #true

# response = gets.chomp.downcase 