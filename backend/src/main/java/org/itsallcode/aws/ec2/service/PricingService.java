package org.itsallcode.aws.ec2.service;

import static java.util.Arrays.asList;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.pricing.AWSPricing;
import com.amazonaws.services.pricing.model.Filter;
import com.amazonaws.services.pricing.model.FilterType;
import com.amazonaws.services.pricing.model.GetProductsRequest;
import com.amazonaws.services.pricing.model.GetProductsResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.inject.Inject;

public class PricingService
{
    private static final Logger LOG = LoggerFactory.getLogger(PricingService.class);

    private final boolean ENABLED = false;

    private final AWSPricing pricing;
    private final ObjectMapper objectMapper;
    private final DecimalFormat decimalFormat;

    @Inject
    public PricingService(final AWSPricing pricing, final ObjectMapper objectMapper)
    {
        this.pricing = pricing;
        this.objectMapper = objectMapper;
        decimalFormat = createDecimalFormat();
    }

    public Optional<BigDecimal> getPriceInUsDollarPerHour(final String location, final String instanceType)
    {
        if (!ENABLED)
        {
            return Optional.empty();
        }
        final List<Filter> filters = buildFilter(location, instanceType);
        LOG.debug("Get products for filter {}", filters);
        final String priceListString = getPriceListString(filters);
        final JsonNode priceList = parse(priceListString);
        final String usDollarPerHourString = extractPricePerHour(priceList);
        final BigDecimal usDollarPerHour = parseBigDecimal(usDollarPerHourString);
        LOG.debug("Got price {} per hour for instance type {}", usDollarPerHour, instanceType);
        return Optional.of(usDollarPerHour);
    }

    private String getPriceListString(final List<Filter> filters)
    {
        final GetProductsResult products = pricing.getProducts(getProductRequest(filters));
        if (products.getPriceList().size() != 1)
        {
            throw new IllegalStateException("Expected one price list entry but got " + products.getPriceList().size()
                    + " for filters " + filters + ": " + products.getPriceList());
        }
        return products.getPriceList().get(0);
    }

    private GetProductsRequest getProductRequest(final List<Filter> filters)
    {
        return new GetProductsRequest().withServiceCode("AmazonEC2").withFilters(filters);
    }

    private List<Filter> buildFilter(final String location, final String instanceType)
    {
        return asList(filter("location", location), //
                filter("instanceType", instanceType), //
                filter("operatingSystem", "Linux"), //
                filter("capacitystatus", "Used"), //
                filter("operation", "RunInstances"));
    }

    private String extractPricePerHour(final JsonNode readTree)
    {
        final JsonNode onDemand = readTree.get("terms").get("OnDemand");
        if (onDemand.size() != 1)
        {
            throw new IllegalStateException("Expected one OnDemand pricing, found " + onDemand);
        }

        final String onDemandField = onDemand.fieldNames().next();
        final JsonNode price = onDemand.get(onDemandField);
        final JsonNode priceDimensions = price.get("priceDimensions");
        assert priceDimensions.size() == 1;
        if (priceDimensions.size() != 1)
        {
            throw new IllegalStateException("Expected one price dimension, found " + priceDimensions);
        }
        final JsonNode firstPrice = priceDimensions.get(priceDimensions.fieldNames().next());
        final String unit = firstPrice.get("unit").asText();
        if (!unit.equals("Hrs"))
        {
            throw new IllegalStateException("Expected unit Hrs but got " + unit);
        }

        return firstPrice.get("pricePerUnit").get("USD").asText();
    }

    private BigDecimal parseBigDecimal(final String usDollarPerHour)
    {
        try
        {
            return (BigDecimal) decimalFormat.parse(usDollarPerHour);
        }
        catch (final ParseException e)
        {
            throw new IllegalStateException("Error parsing big decimal " + usDollarPerHour);
        }
    }

    private static DecimalFormat createDecimalFormat()
    {
        final DecimalFormat nf = (DecimalFormat) NumberFormat.getInstance(Locale.US);
        nf.setParseBigDecimal(true);
        return nf;
    }

    private JsonNode parse(final String json)
    {
        try
        {
            return objectMapper.readTree(json);
        }
        catch (final IOException e)
        {
            throw new IllegalStateException("Error parsing json " + json, e);
        }
    }

    private Filter filter(final String field, final String value)
    {
        return new Filter().withType(FilterType.TERM_MATCH).withField(field).withValue(value);
    }
}
